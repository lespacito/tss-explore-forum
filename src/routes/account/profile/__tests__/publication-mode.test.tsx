import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { BetaPresentationProvider } from "@/features/beta/components/beta-presentation";
import { betaSettings } from "@/features/beta/server/settings";
import { Route } from "../index";
import "@testing-library/jest-dom/vitest";

const fixtures = vi.hoisted(() => ({
	threads: [] as {
		id: string;
		title: string;
		body: string;
		slug: string;
		category: null;
		status: "pending" | "published" | "rejected";
		isSensitive: boolean;
		rejectionReason: string | null;
		createdAt: string;
	}[],
}));
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({
		options,
		useLoaderData: () => ({
			user: { id: "test-user", isAnonymous: true },
			threads: fixtures.threads,
		}),
	}),
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
	redirect: vi.fn(),
}));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSessionCached: vi.fn(),
}));
vi.mock("@/features/auth/server/generate-secret-code-fn", () => ({
	generateSecretCodeFn: vi.fn(),
}));
vi.mock("@/features/threads/server/actions/get-user-threads", () => ({
	getUserThreadsFn: vi.fn(),
}));
vi.mock("@/features/auth/components/link-anonymous-modal", () => ({
	LinkAnonymousModal: () => null,
}));
vi.mock("@/components/tiptap/SafeHtmlDisplay", () => ({
	SafeHtmlDisplay: () => <p>Contenu inventé pour le test.</p>,
}));
const Profile = Route.options.component;
if (!Profile) throw new Error("Profile missing");
afterEach(() => {
	vi.unstubAllEnvs();
	fixtures.threads = [];
});

it.each(["test", "real"] as const)(
	"SSR and hydration use the same normalized %s presentation for all flags",
	(mode) => {
		vi.stubEnv("PUBLICATION_MODE", mode);
		for (const access of ["true", "false"]) {
			for (const open of ["true", "false"]) {
				vi.stubEnv("BETA_ACCESS_REQUIRED", access);
				vi.stubEnv("BETA_SUBMISSIONS_OPEN", open);
				vi.stubEnv("BETA_MODERATION_SCHEDULE", "Lundi 18–19 h");
				const settings = betaSettings();
				const page = (
					<BetaPresentationProvider value={settings}>
						<Profile />
					</BetaPresentationProvider>
				);
				expect(renderToString(page)).toContain(
					mode === "real" ? "Mes témoignages" : "Mes scénarios",
				);
				const view = render(page);
				expect(
					screen.getByRole("heading", {
						level: 1,
						name: mode === "real" ? "Mes témoignages" : "Mes scénarios",
					}),
				).toBeInTheDocument();
				if (mode === "real" && open === "false") {
					expect(
						screen.getByRole("button", { name: "Contributions suspendues" }),
					).toBeDisabled();
					expect(
						screen.queryByRole("link", {
							name: "Rédiger un nouveau témoignage",
						}),
					).toBeNull();
				}
				view.unmount();
			}
		}
	},
);

it.each([true, false])(
	"real profile shows all moderation statuses without changing audience (private=%s)",
	(accessRequired) => {
		fixtures.threads = (["pending", "published", "rejected"] as const).map(
			(status, i) => ({
				id: `fixture-${i}`,
				title: `Récit inventé ${i}`,
				body: "<p>Contenu inventé</p>",
				slug: `fixture-${i}`,
				category: null,
				status,
				isSensitive: false,
				rejectionReason:
					status === "rejected"
						? "Motif de test enregistré, affiché sans réinterprétation."
						: null,
				createdAt: "2026-09-10T10:00:00Z",
			}),
		);
		render(
			<BetaPresentationProvider
				value={{
					publicationMode: "real",
					accessRequired,
					submissionsOpen: false,
				}}
			>
				<Profile />
			</BetaPresentationProvider>,
		);
		for (const label of ["À examiner", "Publié", "Non publié"])
			expect(
				screen.getByRole("status", { name: `Statut: ${label}` }),
			).toBeInTheDocument();
		expect(
			screen.getByText(
				accessRequired
					? "Ces témoignages sont visibles par les participants invités."
					: "Ces témoignages sont accessibles publiquement en lecture.",
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Contributions suspendues" }),
		).toBeDisabled();
		expect(screen.getByText(/Motif de test enregistré/)).toBeInTheDocument();
		expect(document.body.textContent).not.toContain("situation fictive");
	},
);
