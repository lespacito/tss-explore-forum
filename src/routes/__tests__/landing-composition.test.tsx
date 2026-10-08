import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const state = vi.hoisted(() => ({
	submissionsOpen: true,
	createSession: vi.fn(),
	invalidate: vi.fn(),
	navigate: vi.fn(),
}));

// Router/server boundaries are unavailable in jsdom. Keep the real landing
// and contribution button; only their external dependencies are isolated.
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
	Link: ({
		to,
		children,
		...props
	}: ComponentProps<"a"> & { to: string; children: ReactNode }) => (
		<a {...props} href={to}>
			{children}
		</a>
	),
	getRouteApi: () => ({
		useLoaderData: () => ({ beta: { submissionsOpen: state.submissionsOpen } }),
	}),
	useRouterState: () => ({ location: { pathname: "/" } }),
	useRouter: () => ({ invalidate: state.invalidate, navigate: state.navigate }),
}));
vi.mock("@/features/auth/server/create-anonymous-session", () => ({
	createAnonymousSessionFn: state.createSession,
}));

import Footer from "@/components/shadcn-studio/blocks/footer";
import { BetaPresentationProvider } from "@/features/beta/components/beta-presentation";
import { Route } from "../index";

const Home = Route.options.component;
if (!Home) throw new Error("Missing landing component");

afterEach(cleanup);
beforeEach(() => {
	vi.clearAllMocks();
	state.submissionsOpen = true;
	state.createSession.mockResolvedValue({ success: true });
});

describe("Landing composition B", () => {
	it("leads with the mission and a reading link that does not create a session", () => {
		render(<Home />);
		const heading = screen.getByRole("heading", {
			level: 1,
			name: "Mieux comprendre les situations de violence.",
		});
		const reading = screen.getByRole("link", {
			name: "Consulter les situations fictives",
		});
		const contribution = screen.getByRole("button", {
			name: "Proposer une situation fictive",
		});
		expect(reading).toHaveAttribute("href", "/threads");
		expect(reading).toHaveClass("landing-cta");
		expect(
			heading.compareDocumentPosition(reading) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			reading.compareDocumentPosition(contribution) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		reading.addEventListener("click", (event) => event.preventDefault(), {
			once: true,
		});
		fireEvent.click(reading);
		expect(state.createSession).not.toHaveBeenCalled();
	});

	it("explains the public author and internal account without absolute identity promises", () => {
		const { container } = render(<Home />);
		const privacy = screen.getByRole("region", {
			name: "Ce qui est public, ce qui reste interne",
		});
		expect(privacy).toHaveTextContent("Auteur anonyme");
		expect(privacy).toHaveTextContent("Le pseudonyme reste interne");
		expect(privacy).toHaveTextContent("Selon le parcours de compte");
		expect(privacy).toHaveTextContent("certaines données techniques");
		expect(privacy).toHaveTextContent("peuvent permettre de vous reconnaître");
		expect(container).not.toHaveTextContent(
			/Aucun nom ni e-mail n’est demandé|publication sous alias/i,
		);
	});

	it("places a three-step contribution guide before directly available help", () => {
		render(<Home />);
		const contribution = screen.getByRole("region", {
			name: "Contribuer, à votre rythme",
		});
		expect(contribution.querySelectorAll("ol > li")).toHaveLength(3);
		expect(contribution).toHaveTextContent("fournie avec votre invitation");
		expect(contribution).toHaveTextContent("examen humain");
		expect(contribution).toHaveTextContent("Mes situations fictives");
		const help = screen.getByRole("region", {
			name: "Pour une situation réelle, trouver une aide adaptée",
		});
		expect(
			contribution.compareDocumentPosition(help) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(help.querySelector('a[href="/help"]')).not.toBeNull();
		expect(help.closest("details")).toBeNull();
		expect(
			screen.getByRole("link", { name: "Trouver une aide adaptée" }),
		).toHaveAttribute("href", "/help");
	});

	it("answers reading, public identity, recovery and moderation questions consistently", () => {
		render(<Home />);
		const faq = screen.getByRole("region", {
			name: "Quelques réponses avant de participer",
		});
		expect(faq.querySelectorAll("details > summary")).toHaveLength(4);
		expect(faq).toHaveTextContent("Peut-on simplement consulter ?");
		expect(faq).toHaveTextContent("sans envoyer de situation");
		expect(faq).toHaveTextContent("Auteur anonyme");
		expect(faq).toHaveTextContent("certaines données techniques");
		expect(faq).toHaveTextContent("code de récupération");
		expect(faq).toHaveTextContent("À examiner, Publiée ou Non publiée");
	});

	it("shows one short illustration without posing as a published situation", () => {
		render(<Home />);
		const example = screen.getByRole("figure", {
			name: "Exemple fictif — illustration, pas une publication",
		});
		const words = example
			.querySelector("blockquote")
			?.textContent?.trim()
			.split(/\s+/);
		expect(words?.length).toBeLessThanOrEqual(35);
		expect(within(example).queryByRole("link")).not.toBeInTheDocument();
		expect(example).not.toHaveTextContent(/Auteur anonyme|Publiée|À examiner/);
	});

	it("keeps reading and help available while contributions are suspended", () => {
		state.submissionsOpen = false;
		render(<Home />);
		expect(
			screen.getByRole("button", { name: "Dépôts suspendus" }),
		).toBeDisabled();
		expect(
			screen.getByRole("link", { name: "Consulter les situations fictives" }),
		).toHaveAttribute("href", "/threads");
		expect(
			screen.getByRole("link", { name: "Trouver une aide adaptée" }),
		).toHaveAttribute("href", "/help");
	});

	it("retains the existing contribution action and its pending state", async () => {
		let finish: ((value: { success: boolean }) => void) | undefined;
		state.createSession.mockImplementation(
			() =>
				new Promise((resolve) => {
					finish = resolve;
				}),
		);
		render(<Home />);
		fireEvent.click(
			screen.getByRole("button", { name: "Proposer une situation fictive" }),
		);
		expect(screen.getByRole("button", { name: "Chargement…" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Chargement…" })).toHaveAttribute(
			"aria-busy",
			"true",
		);
		expect(
			screen.getByRole("link", { name: "Consulter les situations fictives" }),
		).toBeInTheDocument();
		finish?.({ success: true });
		await waitFor(() =>
			expect(state.navigate).toHaveBeenCalledWith({ to: "/threads/new" }),
		);
		expect(state.createSession).toHaveBeenCalledTimes(1);
	});
});

describe("Landing access and contribution flags", () => {
	it.each(
		[true, false].flatMap((accessRequired) =>
			[true, false].map((submissionsOpen) => [accessRequired, submissionsOpen]),
		),
	)(
		"accessRequired=%s, submissionsOpen=%s",
		(accessRequired, submissionsOpen) => {
			state.submissionsOpen = submissionsOpen;
			const { container } = render(
				<BetaPresentationProvider value={{ accessRequired, submissionsOpen }}>
					<Home />
					<Footer />
				</BetaPresentationProvider>,
			);
			expect(
				screen.getByRole("link", { name: "Consulter les situations fictives" }),
			).toHaveAttribute("href", "/threads");
			const button = screen.getByRole("button", {
				name: submissionsOpen
					? "Proposer une situation fictive"
					: "Dépôts suspendus",
			});
			if (submissionsOpen) expect(button).toBeEnabled();
			else expect(button).toBeDisabled();
			if (accessRequired) {
				expect(container).toHaveTextContent("Bêta privée pour adultes invités");
				expect(container).toHaveTextContent("fournie avec votre invitation");
				expect(container).toHaveTextContent("À quoi servent les deux codes ?");
			} else {
				expect(container).not.toHaveTextContent(
					/bêta privée|invités|invitation|deux codes/i,
				);
				expect(container).toHaveTextContent("Accès public pour adultes");
				expect(container).toHaveTextContent(
					"À quoi sert le code de récupération ?",
				);
				if (!submissionsOpen)
					expect(container).toHaveTextContent(
						"Les contributions sont temporairement suspendues",
					);
				else
					expect(container).toHaveTextContent(
						"rédigez uniquement une situation fictive",
					);
			}
		},
	);
});

describe("Landing publication modes and flags", () => {
	it.each(
		(["test", "real"] as const).flatMap((publicationMode) =>
			[true, false].flatMap((accessRequired) =>
				[true, false].map((submissionsOpen) => ({
					publicationMode,
					accessRequired,
					submissionsOpen,
				})),
			),
		),
	)(
		"$publicationMode, accessRequired=$accessRequired, submissionsOpen=$submissionsOpen",
		({ publicationMode, accessRequired, submissionsOpen }) => {
			state.submissionsOpen = submissionsOpen;
			const { container } = render(
				<BetaPresentationProvider
					value={{ publicationMode, accessRequired, submissionsOpen }}
				>
					<Home />
					<Footer />
				</BetaPresentationProvider>,
			);
			const real = publicationMode === "real";
			expect(
				screen.getByRole("link", {
					name: real
						? "Lire les témoignages"
						: "Consulter les situations fictives",
				}),
			).toHaveAttribute("href", "/threads");
			const button = screen.getByRole("button", {
				name: submissionsOpen
					? real
						? "Rédiger un témoignage"
						: "Proposer une situation fictive"
					: "Dépôts suspendus",
			});
			if (submissionsOpen) expect(button).toBeEnabled();
			else {
				expect(button).toBeDisabled();
				if (real || !accessRequired)
					expect(container).toHaveTextContent(
						"Les contributions sont temporairement suspendues",
					);
			}
			expect(container).toHaveTextContent("examen humain");
			if (real) {
				expect(container).toHaveTextContent(
					"victimes ou témoins de violences et de harcèlement",
				);
				expect(container).toHaveTextContent("Mes témoignages");
				expect(container).toHaveTextContent(
					"ne remplace ni un service d’urgence ni un accompagnement professionnel",
				);
				expect(container).not.toHaveTextContent(
					/situations fictives uniquement|modération examine les situations fictives|Cette bêta|contribuer au test|sans récit personnel|fournie avec votre invitation/i,
				);
				expect(container).toHaveTextContent(
					"Exemple fictif — illustration, pas une publication",
				);
				expect(container).toHaveTextContent(
					"Cela ne garantit pas un anonymat absolu",
				);
			} else
				expect(container).toHaveTextContent("Situations fictives uniquement");
			if (!accessRequired)
				expect(container).not.toHaveTextContent(
					/bêta privée|adultes invités|code d’invitation/i,
				);
			expect(state.createSession).not.toHaveBeenCalled();
		},
	);
});
