import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ navigate: vi.fn() }),
}));
vi.mock("@/features/auth/components/social-auth-buttons", () => ({
	SocialAuthButtons: () => null,
}));
vi.mock("@/features/auth/lib/auth-client", () => ({
	signIn: { username: vi.fn() },
}));
vi.mock("@/features/auth/server/get-user-email-by-username", () => ({
	getUserEmailByUsername: vi
		.fn()
		.mockResolvedValue({ email: "private@example.com" }),
}));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("sonner", () => ({
	toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
import { signIn } from "@/features/auth/lib/auth-client";
import { SignInTab } from "../sign-in-tab";
it("requests manual email verification without looking up the account email", async () => {
	const openVerification = vi.fn();
	vi.mocked(signIn.username).mockImplementation(async (_data, options) => {
		await options?.onError?.({
			error: { code: "EMAIL_NOT_VERIFIED" },
		} as never);
		return { data: null, error: null } as never;
	});
	render(
		<SignInTab
			openEmailVerificationTab={openVerification}
			openForgotPassword={vi.fn()}
		/>,
	);
	const user = userEvent.setup();
	await user.type(
		screen.getByLabelText(/nom d'utilisateur/i),
		"unverifieduser",
	);
	await user.type(screen.getByLabelText(/mot de passe/i), "Password123!");
	await user.tab();
	const button = screen.getByRole("button", { name: /se connecter/i });
	await waitFor(() => expect(button).toBeEnabled());
	await user.click(button);
	await waitFor(() => expect(openVerification).toHaveBeenCalledWith(""));
});
