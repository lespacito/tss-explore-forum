import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
vi.mock("@/features/auth/server/link-anonymous-account", () => ({
	linkAnonymousAccountFn: vi.fn(),
}));
vi.mock("@/features/auth/lib/auth-client", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/logger/client-logger", () => ({
	logger: { info: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({
	toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

import { signOut } from "@/features/auth/lib/auth-client";
import { linkAnonymousAccountFn } from "@/features/auth/server/link-anonymous-account";
import { LinkAnonymousModal } from "../link-anonymous-modal";

it.each(["Escape", "outside"])(
	"continues verification on %s dismissal",
	async (action) => {
		const onDecline = vi.fn();
		const onClose = vi.fn();
		render(
			<LinkAnonymousModal
				isOpen
				onClose={onClose}
				anonymousUserId="source"
				newUserId="destination"
				email="new@example.com"
				onLinkDecline={onDecline}
			/>,
		);
		if (action === "Escape") await userEvent.setup().keyboard("{Escape}");
		else {
			const overlay = document.querySelector('[data-slot="dialog-overlay"]');
			if (!overlay) throw new Error("Dialog overlay missing");
			await userEvent.setup().click(overlay);
		}
		await waitFor(() => expect(onDecline).toHaveBeenCalledTimes(1));
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(linkAnonymousAccountFn).not.toHaveBeenCalled();
	},
);
it.each([0, 1, 2])(
	"passes the guaranteed success count %i and completes verification even if signout fails",
	async (count) => {
		const onSuccess = vi.fn();
		const onClose = vi.fn();
		vi.mocked(linkAnonymousAccountFn).mockResolvedValue({
			success: true,
			linkedPostsCount: count,
		});
		vi.mocked(signOut).mockRejectedValueOnce(new Error("offline"));
		render(
			<LinkAnonymousModal
				isOpen
				onClose={onClose}
				anonymousUserId="source"
				newUserId="destination"
				email="new@example.com"
				onLinkSuccess={onSuccess}
			/>,
		);
		const user = userEvent.setup();
		await user.type(
			screen.getByLabelText(/mot de passe du nouveau compte/i),
			"password",
		);
		await user.click(screen.getByRole("button", { name: /oui, lier/i }));
		await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(count));
		expect(onClose).toHaveBeenCalledTimes(1);
	},
);
beforeEach(() => vi.clearAllMocks());
it("uses the signup email supplied after the initially closed modal mounts", async () => {
	vi.mocked(linkAnonymousAccountFn).mockResolvedValue({
		success: false,
		error: "Identifiants invalides",
	});
	const props = {
		onClose: vi.fn(),
		anonymousUserId: "source",
		newUserId: null,
	};
	const { rerender } = render(
		<LinkAnonymousModal {...props} isOpen={false} email="" />,
	);
	rerender(<LinkAnonymousModal {...props} isOpen email="new@example.com" />);
	const user = userEvent.setup();
	await user.type(
		screen.getByLabelText(/mot de passe du nouveau compte/i),
		"password",
	);
	await user.click(screen.getByRole("button", { name: /oui, lier/i }));
	await waitFor(() =>
		expect(linkAnonymousAccountFn).toHaveBeenCalledWith({
			data: { email: "new@example.com", password: "password" },
		}),
	);
});
it("explains verified-first linking and retry without promising an unverified transfer", () => {
	render(
		<LinkAnonymousModal
			isOpen
			onClose={vi.fn()}
			anonymousUserId="source"
			newUserId="destination"
			email="new@example.com"
		/>,
	);
	expect(screen.getByText(/vérifiez d'abord votre email/i)).toBeInTheDocument();
	expect(
		screen.getByText(/rétablissez votre session anonyme avec votre code/i),
	).toBeInTheDocument();
	expect(
		screen.queryByText(/ne pourrez pas les lier ultérieurement/i),
	).not.toBeInTheDocument();
});
it("an unverified destination refusal preserves the source and can continue verification", async () => {
	vi.mocked(linkAnonymousAccountFn).mockResolvedValueOnce({
		success: false,
		error: "Compte non vérifié",
	});
	const onDecline = vi.fn();
	const onClose = vi.fn();
	render(
		<LinkAnonymousModal
			isOpen
			onClose={onClose}
			anonymousUserId="source"
			newUserId="destination"
			email="new@example.com"
			onLinkDecline={onDecline}
		/>,
	);
	const user = userEvent.setup();
	await user.type(
		screen.getByLabelText(/mot de passe du nouveau compte/i),
		"password",
	);
	await user.click(screen.getByRole("button", { name: /oui, lier/i }));
	await waitFor(() =>
		expect(
			screen.getByLabelText(/mot de passe du nouveau compte/i),
		).toHaveValue(""),
	);
	expect(signOut).not.toHaveBeenCalled();
	expect(onClose).not.toHaveBeenCalled();
	await user.click(screen.getByRole("button", { name: /non, garder séparé/i }));
	expect(onDecline).toHaveBeenCalledTimes(1);
	expect(onClose).toHaveBeenCalledTimes(1);
	expect(signOut).not.toHaveBeenCalled();
});
it("explains that the anonymous code cannot recover transferred content", () => {
	render(
		<LinkAnonymousModal
			isOpen
			onClose={vi.fn()}
			anonymousUserId="source"
			newUserId="destination"
			email="new@example.com"
		/>,
	);
	expect(
		screen.getByText(/ne permet plus de récupérer les publications liées/i),
	).toBeInTheDocument();
});
it("clears destination password when optional linking is declined", async () => {
	const user = userEvent.setup();
	const onClose = vi.fn();
	render(
		<LinkAnonymousModal
			isOpen
			onClose={onClose}
			anonymousUserId="source"
			newUserId="destination"
			email="new@example.com"
		/>,
	);
	const password = screen.getByLabelText(/mot de passe du nouveau compte/i);
	await user.type(password, "destination-password");
	await user.click(screen.getByRole("button", { name: /non, garder séparé/i }));
	expect(password).toHaveValue("");
	expect(linkAnonymousAccountFn).not.toHaveBeenCalled();
	expect(onClose).toHaveBeenCalled();
});
it("asks for destination password and sends credentials without account IDs", async () => {
	const user = userEvent.setup();
	vi.mocked(linkAnonymousAccountFn).mockResolvedValue({
		success: true,
		linkedPostsCount: 1,
	});
	render(
		<LinkAnonymousModal
			isOpen
			onClose={vi.fn()}
			anonymousUserId="source"
			newUserId="destination"
			email="new@example.com"
		/>,
	);
	const button = screen.getByRole("button", { name: /oui, lier/i });
	expect(button).toBeDisabled();
	await user.type(
		screen.getByLabelText(/mot de passe du nouveau compte/i),
		"destination-password",
	);
	await user.click(button);
	await waitFor(() =>
		expect(linkAnonymousAccountFn).toHaveBeenCalledWith({
			data: { email: "new@example.com", password: "destination-password" },
		}),
	);
});
