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
import { linkAnonymousAccountFn } from "@/features/auth/server/link-anonymous-account";
import { LinkAnonymousModal } from "../link-anonymous-modal";
import { signOut } from "@/features/auth/lib/auth-client";

it.each(["Escape", "outside"])("continues verification on %s dismissal", async (action) => {
	const onDecline = vi.fn();
	const onClose = vi.fn();
	render(<LinkAnonymousModal isOpen onClose={onClose} anonymousUserId="source" newUserId="destination" email="new@example.com" onLinkDecline={onDecline} />);
	if (action === "Escape") await userEvent.setup().keyboard("{Escape}");
	else {
		const overlay = document.querySelector('[data-slot="dialog-overlay"]');
		if (!overlay) throw new Error("Dialog overlay missing");
		await userEvent.setup().click(overlay);
	}
	await waitFor(() => expect(onDecline).toHaveBeenCalledTimes(1));
	expect(onClose).toHaveBeenCalledTimes(1);
	expect(linkAnonymousAccountFn).not.toHaveBeenCalled();
});
it.each([0, 1, 2])("passes the guaranteed success count %i and completes verification even if signout fails", async (count) => {
	const onSuccess = vi.fn();
	const onClose = vi.fn();
	vi.mocked(linkAnonymousAccountFn).mockResolvedValue({ success: true, linkedPostsCount: count });
	vi.mocked(signOut).mockRejectedValueOnce(new Error("offline"));
	render(<LinkAnonymousModal isOpen onClose={onClose} anonymousUserId="source" newUserId="destination" email="new@example.com" onLinkSuccess={onSuccess} />);
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(/mot de passe du nouveau compte/i), "password");
	await user.click(screen.getByRole("button", { name: /oui, lier/i }));
	await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(count));
	expect(onClose).toHaveBeenCalledTimes(1);
});
beforeEach(() => vi.clearAllMocks());
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
