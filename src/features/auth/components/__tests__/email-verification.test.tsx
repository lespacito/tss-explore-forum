import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
vi.mock("@/features/auth/lib/auth-client", () => ({
	authClient: {
		sendVerificationEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
	},
}));
vi.mock("@/features/auth/components/better-auth-action-button", () => ({
	BetterAuthActionButton: ({
		action,
		children,
		disabled,
	}: {
		action: () => void;
		children: React.ReactNode;
		disabled: boolean;
	}) => (
		<button type="button" disabled={disabled} onClick={action}>
			{children}
		</button>
	),
}));
import { EmailVerification } from "../email-verification";
import { authClient } from "@/features/auth/lib/auth-client";
it("accepts a manually supplied email without disclosing the stored address", async () => {
	render(<EmailVerification email="" />);
	const user = userEvent.setup();
	expect(screen.getByRole("button")).toBeDisabled();
	await user.type(screen.getByLabelText(/^email$/i), "supplied@example.com");
	await waitFor(() => expect(screen.getByRole("button")).toBeEnabled());
	await user.click(screen.getByRole("button"));
	expect(authClient.sendVerificationEmail).toHaveBeenCalledWith({
		email: "supplied@example.com",
		callbackURL: "/",
	});
});
