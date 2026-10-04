import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const state = vi.hoisted(() => ({
	user: { id: "restored-source", isAnonymous: true },
	threads: [],
}));
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: any) => ({
		options,
		useLoaderData: () => state,
	}),
	Link: ({ to, children }: any) => <a href={to}>{children}</a>,
	redirect: vi.fn(),
}));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSessionCached: vi.fn(),
}));
vi.mock("@/features/threads/server/actions/get-user-threads", () => ({
	getUserThreadsFn: vi.fn(),
}));
vi.mock("@/features/auth/server/generate-secret-code-fn", () => ({
	generateSecretCodeFn: vi.fn(),
}));
vi.mock("@/features/auth/server/link-anonymous-account", () => ({
	linkAnonymousAccountFn: vi.fn(),
}));
vi.mock("@/features/auth/lib/auth-client", () => ({
	getSession: vi.fn(),
	signOut: vi.fn(),
}));
vi.mock("@/lib/logger/client-logger", () => ({
	logger: { info: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({
	toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
import { Route } from "@/routes/account/profile/index";
import { getSession, signOut } from "@/features/auth/lib/auth-client";
import { linkAnonymousAccountFn } from "@/features/auth/server/link-anonymous-account";

const Profile = Route.options.component!;
beforeEach(() => {
	vi.resetAllMocks();
	state.user = { id: "restored-source", isAnonymous: true };
	vi.mocked(getSession).mockResolvedValue({
		data: { user: state.user },
		error: null,
	} as any);
});
async function openAndSubmit() {
	const user = userEvent.setup();
	render(<Profile />);
	await user.click(
		screen.getByRole("button", { name: "Lier à un compte vérifié" }),
	);
	await user.type(
		screen.getByLabelText(/^email du compte vérifié$/i),
		"existing@example.com",
	);
	await user.type(
		screen.getByLabelText(/mot de passe du compte vérifié/i),
		"destination-password",
	);
	await user.click(screen.getByRole("button", { name: /oui, lier/i }));
}
it("restored anonymous profile opens existing credentials without signup or a client destination ID", async () => {
	vi.mocked(linkAnonymousAccountFn).mockResolvedValue({
		success: true,
		linkedPostsCount: 1,
	});
	await openAndSubmit();
	await waitFor(() =>
		expect(linkAnonymousAccountFn).toHaveBeenCalledWith({
			data: { email: "existing@example.com", password: "destination-password" },
		}),
	);
	expect(await screen.findByText(/liaison effectuée/i)).toBeInTheDocument();
	expect(screen.getByRole("status").tagName).toBe("OUTPUT");
	expect(
		screen.getByRole("link", { name: /se connecter au compte vérifié/i }),
	).toHaveAttribute("href", "/auth/login");
	expect(signOut).not.toHaveBeenCalled();
});
it("registered profile has no linking entry", () => {
	state.user.isAnonymous = false;
	render(<Profile />);
	expect(
		screen.queryByRole("button", { name: "Lier à un compte vérifié" }),
	).not.toBeInTheDocument();
});
it.each(["Compte non vérifié", "Identifiants invalides"])(
	"%s leaves the recovered session and retry available",
	async (error) => {
		vi.mocked(linkAnonymousAccountFn).mockResolvedValue({
			success: false,
			error,
		});
		await openAndSubmit();
		await waitFor(() => expect(linkAnonymousAccountFn).toHaveBeenCalledOnce());
		expect(
			screen.getByLabelText(/mot de passe du compte vérifié/i),
		).toHaveValue("");
		expect(
			screen.getByRole("button", { name: /oui, lier/i }),
		).toBeInTheDocument();
		expect(signOut).not.toHaveBeenCalled();
		expect(screen.queryByText(/liaison effectuée/i)).not.toBeInTheDocument();
	},
);
it.each(["error-result", "throw", "replacement", "registered"])(
	"preflight %s prevents linking another tab's session",
	async (kind) => {
		if (kind === "throw")
			vi.mocked(getSession).mockRejectedValue(new Error("offline"));
		else
			vi.mocked(getSession).mockResolvedValue({
				data:
					kind === "replacement"
						? { user: { id: "other-source", isAnonymous: true } }
						: kind === "registered"
							? { user: { id: state.user.id, isAnonymous: false } }
							: null,
				error: kind === "error-result" ? { message: "offline" } : null,
			} as any);
		await openAndSubmit();
		await waitFor(() =>
			expect(
				screen.getByLabelText(/mot de passe du compte vérifié/i),
			).toHaveValue(""),
		);
		expect(linkAnonymousAccountFn).not.toHaveBeenCalled();
		expect(signOut).not.toHaveBeenCalled();
	},
);
it.each(["session-error", "replacement-cookie"])(
	"committed zero-count success survives %s without ambient cleanup",
	async (kind) => {
		vi.mocked(linkAnonymousAccountFn).mockImplementation(async () => {
			if (kind === "session-error")
				vi.mocked(getSession).mockRejectedValue(
					new Error("offline after commit"),
				);
			else
				vi.mocked(getSession).mockResolvedValue({
					data: { user: { id: "another-tab", isAnonymous: false } },
					error: null,
				} as any);
			vi.mocked(signOut).mockResolvedValue({
				error: { message: "cleanup failed" },
			} as any);
			return { success: true, linkedPostsCount: 0 };
		});
		await openAndSubmit();
		expect(
			await screen.findByText(/liaison effectuée : 0/i),
		).toBeInTheDocument();
		expect(getSession).toHaveBeenCalledTimes(1);
		expect(getSession).toHaveBeenCalledWith({
			query: { disableCookieCache: true },
		});
		expect(signOut).not.toHaveBeenCalled();
		expect(
			screen.queryByRole("button", { name: "Lier à un compte vérifié" }),
		).not.toBeInTheDocument();
	},
);
