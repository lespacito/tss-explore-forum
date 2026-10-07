import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const state = vi.hoisted(() => ({
	user: null as null | {
		id: string;
		displayUsername: string;
		username: string;
		email: string;
		isAnonymous: boolean;
		role: string;
		image: null;
	},
	theme: "light",
	setTheme: vi.fn(),
	signOut: vi.fn(),
	loading: false,
}));
vi.mock("@tanstack/react-router", () => ({
	getRouteApi: () => ({
		useLoaderData: () => ({
			authSession: { user: state.user },
			beta: { submissionsOpen: true, moderationSchedule: "Test" },
		}),
	}),
	useRouterState: () => ({
		location: { pathname: "/" },
		isLoading: state.loading,
	}),
	Link: ({
		to,
		children,
		...props
	}: ComponentProps<"a"> & { to: string; children: ReactNode }) => (
		<a {...props} href={to}>
			{children}
		</a>
	),
}));
vi.mock("@/components/theme", () => ({
	useTheme: () => ({ resolvedTheme: state.theme, setTheme: state.setTheme }),
}));
vi.mock("@/hooks/use-is-client", () => ({ useIsClient: () => true }));
vi.mock("@/features/auth/lib/auth-client", () => ({ signOut: state.signOut }));

import { BetaPresentationProvider } from "@/features/beta/components/beta-presentation";
import Navbar from "./navbar-component";

afterEach(cleanup);
beforeEach(() => {
	vi.clearAllMocks();
	state.user = null;
	state.theme = "light";
	state.loading = false;
});

describe("Civic navbar", () => {
	it("exposes a flat compact menu with information, theme and guest recovery", async () => {
		const user = userEvent.setup();
		render(<Navbar />);
		await user.click(
			screen.getByRole("button", { name: /Menu de navigation/ }),
		);
		const menu = screen.getByRole("menu");
		expect(menu).toHaveTextContent("Informations");
		expect(
			screen.getAllByRole("menuitem", { name: /Retrouver ma session/ })[0],
		).toHaveAttribute("href", "/auth/anonymous-signin");
		expect(
			screen.getByRole("menuitemcheckbox", { name: "Thème sombre" }),
		).toHaveAttribute("aria-checked", "false");
		expect(menu.querySelector('[aria-haspopup="menu"]')).toBeNull();
	});

	it.each([
		["USER", true, false],
		["MODERATOR", false, true],
		["ADMIN", false, true],
	])(
		"preserves account destinations and role visibility for %s",
		async (role, isAnonymous, canModerate) => {
			state.user = {
				id: "user-1",
				displayUsername: "Nom interne très long",
				username: "internal",
				email: "fixture@example.invalid",
				isAnonymous,
				role,
				image: null,
			};
			const user = userEvent.setup();
			render(<Navbar />);
			await user.click(
				screen.getByRole("button", { name: /Menu de navigation/ }),
			);
			expect(
				screen.getByRole("menuitem", { name: /Mes situations fictives/ }),
			).toHaveAttribute("href", "/account/profile");
			expect(
				screen.getByRole("menuitem", { name: /Paramètres/ }),
			).toHaveAttribute("href", "/account/settings");
			if (canModerate)
				expect(
					screen.getByRole("menuitem", { name: /Modération/ }),
				).toHaveAttribute("href", "/admin/moderation");
			else
				expect(
					screen.queryByRole("menuitem", { name: /Modération/ }),
				).toBeNull();
			expect(
				screen.queryByRole("menuitem", { name: /Retrouver ma session/ }),
			).toBeNull();
			await user.click(screen.getByRole("menuitem", { name: /Déconnexion/ }));
			expect(state.signOut).toHaveBeenCalledOnce();
			expect(state.signOut).toHaveBeenCalledWith({
				fetchOptions: { onSuccess: expect.any(Function) },
			});
		},
	);

	it("sets the same theme preference and keeps the compact menu open", async () => {
		const user = userEvent.setup();
		render(<Navbar />);
		await user.click(
			screen.getByRole("button", { name: /Menu de navigation/ }),
		);
		await user.click(
			screen.getByRole("menuitemcheckbox", { name: "Thème sombre" }),
		);
		expect(state.setTheme).toHaveBeenCalledWith("dark");
		expect(screen.getByRole("menu")).toBeInTheDocument();
	});

	it("restores focus to the menu trigger after keyboard dismissal", async () => {
		const user = userEvent.setup();
		render(<Navbar />);
		const trigger = screen.getByRole("button", { name: /Menu de navigation/ });
		trigger.focus();
		await user.keyboard("{Enter}");
		expect(screen.getByRole("menu")).toBeInTheDocument();
		await user.keyboard("{ArrowDown}{Escape}");
		expect(screen.queryByRole("menu")).toBeNull();
		expect(trigger).toHaveFocus();
	});

	it("preserves the desktop account menu and its identity details", async () => {
		state.user = {
			id: "user-1",
			displayUsername: "Nom interne",
			username: "internal",
			email: "fixture@example.invalid",
			isAnonymous: true,
			role: "USER",
			image: null,
		};
		const user = userEvent.setup();
		render(<Navbar />);
		await user.click(screen.getByRole("button", { name: "Mon compte" }));
		expect(screen.getByRole("menu")).toHaveTextContent("Nom interne");
		expect(screen.getByRole("menu")).toHaveTextContent("Session anonyme");
		expect(
			screen.getByRole("menuitem", { name: /Paramètres/ }),
		).toHaveAttribute("href", "/account/settings");
	});

	it("shows a session-loading status without exposing account actions", async () => {
		state.loading = true;
		const user = userEvent.setup();
		render(<Navbar />);
		await user.click(
			screen.getByRole("button", { name: /Menu de navigation/ }),
		);
		expect(screen.getByRole("status")).toHaveTextContent(
			"Chargement de la session",
		);
		expect(screen.queryByRole("menuitem", { name: /Déconnexion/ })).toBeNull();
	});
});

it.each([true, false])(
	"labels the navbar from the access flag (%s)",
	(accessRequired) => {
		render(
			<BetaPresentationProvider
				value={{ accessRequired, submissionsOpen: true }}
			>
				<Navbar />
			</BetaPresentationProvider>,
		);
		expect(
			screen.getByText(accessRequired ? "Bêta privée" : "Accès public"),
		).toBeInTheDocument();
		if (!accessRequired)
			expect(screen.queryByText("Bêta privée")).not.toBeInTheDocument();
	},
);
