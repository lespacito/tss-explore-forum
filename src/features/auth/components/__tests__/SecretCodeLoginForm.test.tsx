import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SecretCodeLoginForm } from "../SecretCodeLoginForm";
import "@testing-library/jest-dom/vitest";

vi.mock("@/features/auth/lib/auth-client", () => ({
	signIn: {
		credentials: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
	},
}));

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
	useRouter: vi.fn(() => ({
		navigate: vi.fn(),
	})),
}));

import { useRouter } from "@tanstack/react-router";
import { signIn } from "@/features/auth/lib/auth-client";

/**
 * Tests for SecretCodeLoginForm Component (Task 4)
 *
 * Coverage:
 * - Subtask 4.1: Component creation with TanStack Form
 * - Subtask 4.2: Zod validation integration
 * - Subtask 4.3: Auto-formatting with dashes every 4 characters
 * - Subtask 4.4: Paste button for mobile convenience
 * - Subtask 4.5: Loading, error, success states with clear feedback
 * - Subtask 4.6: Empathetic error messages (not accusatory)
 */
describe("SecretCodeLoginForm Component - Task 4", () => {
	const mockSigninFn = vi.mocked(signIn.credentials);
	const mockNavigate = vi.fn();
	let clipboardReadTextSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock router
		vi.mocked(useRouter).mockReturnValue({
			navigate: mockNavigate,
		} as any);

		// Mock clipboard API
		clipboardReadTextSpy = vi.fn().mockResolvedValue("K7MN-P8QR");
		Object.defineProperty(navigator, "clipboard", {
			value: {
				readText: clipboardReadTextSpy,
			},
			writable: true,
			configurable: true,
		});
	});

	const createUser = () => {
		const user = userEvent.setup();
		Object.defineProperty(navigator, "clipboard", {
			value: { readText: clipboardReadTextSpy },
			writable: true,
			configurable: true,
		});
		return user;
	};

	describe("Subtask 4.1: Component Rendering", () => {
		it("should render the form with code input field", () => {
			render(<SecretCodeLoginForm />);

			expect(screen.getByLabelText("Code Secret")).toBeInTheDocument();
			expect(screen.getByPlaceholderText("AB7K-9X2M")).toBeInTheDocument();
		});

		it("should render submit button", () => {
			render(<SecretCodeLoginForm />);

			expect(
				screen.getByRole("button", { name: /se connecter/i }),
			).toBeInTheDocument();
		});

		it("should render paste button", () => {
			render(<SecretCodeLoginForm />);

			expect(
				screen.getByRole("button", { name: /coller le code/i }),
			).toBeInTheDocument();
		});

		it("should display format help text", () => {
			render(<SecretCodeLoginForm />);

			expect(
				screen.getByText("Format: XXXX-XXXX ou XXXX-XXXX-XXXX"),
			).toBeInTheDocument();
		});
	});

	describe("Subtask 4.2: Zod Validation", () => {
		it("should validate minimum length", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Le code secret est trop court",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "ABC");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(
					screen.getByText(/le code secret est trop court/i),
				).toBeInTheDocument();
			});
		});

		it("should validate format with regex", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Format invalide",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "ABCDEFGHX");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText(/format invalide/i)).toBeInTheDocument();
			});
		});

		it("should accept valid 8-character code", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({ success: true, userId: "user_123" });
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "K7MN-P8QR");

			// Should not show format error
			expect(screen.queryByText(/format invalide/i)).not.toBeInTheDocument();
		});

		it("should accept valid 12-character code", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({ success: true, userId: "user_456" });
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "X4BT-9C2W-H5JK");

			// Should not show format error
			expect(screen.queryByText(/format invalide/i)).not.toBeInTheDocument();
		});
	});

	describe("Subtask 4.3: Auto-formatting", () => {
		it("should auto-format code with dashes every 4 characters", async () => {
			const user = userEvent.setup();
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
			await user.type(input, "K7MNP8QR");

			expect(input.value).toBe("K7MN-P8QR");
		});

		it("should convert lowercase to uppercase", async () => {
			const user = userEvent.setup();
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
			await user.type(input, "k7mnp8qr");

			expect(input.value).toBe("K7MN-P8QR");
		});

		it("should handle 12-character code formatting", async () => {
			const user = userEvent.setup();
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
			await user.type(input, "X4BT9C2WH5JK");

			expect(input.value).toBe("X4BT-9C2W-H5JK");
		});

		it("should remove non-alphanumeric characters except dashes", async () => {
			const user = userEvent.setup();
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
			await user.type(input, "K7M@N#P8$Q%R");

			expect(input.value).toBe("K7MN-P8QR");
		});
	});

	describe("Subtask 4.4: Paste Button", () => {
		it("should paste code from clipboard when button clicked", async () => {
			const user = createUser();
			clipboardReadTextSpy.mockResolvedValue("K7MNP8QR");
			render(<SecretCodeLoginForm />);

			const pasteButton = screen.getByRole("button", {
				name: /coller le code/i,
			});
			await user.click(pasteButton);

			await waitFor(() => {
				const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
				expect(input.value).toBe("K7MN-P8QR");
			});
		});

		it("should format pasted code with dashes", async () => {
			const user = createUser();
			clipboardReadTextSpy.mockResolvedValue("x4bt9c2wh5jk");
			render(<SecretCodeLoginForm />);

			const pasteButton = screen.getByRole("button", {
				name: /coller le code/i,
			});
			await user.click(pasteButton);

			await waitFor(() => {
				const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
				expect(input.value).toBe("X4BT-9C2W-H5JK");
			});
		});

		it("should sanitize pasted code with whitespace", async () => {
			const user = createUser();
			clipboardReadTextSpy.mockResolvedValue("  K7MN P8QR  ");
			render(<SecretCodeLoginForm />);

			const pasteButton = screen.getByRole("button", {
				name: /coller le code/i,
			});
			await user.click(pasteButton);

			await waitFor(() => {
				const input = screen.getByLabelText("Code Secret") as HTMLInputElement;
				expect(input.value).toBe("K7MN-P8QR");
			});
		});

		it("should handle clipboard permission denied gracefully", async () => {
			const user = createUser();
			const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation();
			clipboardReadTextSpy.mockRejectedValue(new Error("Permission denied"));
			render(<SecretCodeLoginForm />);

			const pasteButton = screen.getByRole("button", {
				name: /coller le code/i,
			});
			await user.click(pasteButton);

			await waitFor(() => {
				expect(consoleWarnSpy).toHaveBeenCalledWith(
					expect.stringMatching(/^\[.*\] \[WARN\]$/),
					"Impossible d'accéder au presse-papiers",
					expect.any(Error),
				);
			});

			consoleWarnSpy.mockRestore();
		});
	});

	describe("Subtask 4.5: Loading, Error, Success States", () => {
		it("should show loading state during submission", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: true, userId: "user_123" }),
							100,
						),
					),
			);
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "K7MN-P8QR");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			expect(
				screen.getByRole("button", { name: /connexion…/i }),
			).toBeInTheDocument();
			expect(submitButton).toBeDisabled();
		});

		it("should confirm the recovered session and open personal publications", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({ success: true, userId: "user_123" });
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "K7MN-P8QR");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith("Session retrouvée", {
					description: "Voici vos publications.",
				});
				expect(mockNavigate).toHaveBeenCalledWith({ to: "/account/profile" });
			});
		});

		it("should display error message on failed signin", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Impossible de se connecter. Vérifiez votre code.",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "XXXX-YYYY");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(
					screen.getByText(/impossible de se connecter/i),
				).toBeInTheDocument();
			});
		});

		it("should show a generic error message for an unsuccessful response", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Unexpected error",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "XXXX-YYYY");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(
					screen.getByText(/impossible de se connecter/i),
				).toBeInTheDocument();
			});
		});
	});

	describe("Subtask 4.6: Empathetic Error Messages", () => {
		it("should display empathetic message for invalid code", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Impossible de se connecter. Vérifiez votre code.",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "XXXX-YYYY");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				const errorMessage = screen.getByRole("alert");
				expect(errorMessage).toBeInTheDocument();
				expect(errorMessage.textContent).not.toMatch(/invalide|incorrect/i);
				expect(errorMessage.textContent).toMatch(/vérifiez/i);
			});
		});

		it("should not reveal whether code exists or not", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Impossible de se connecter. Vérifiez votre code.",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "XXXX-YYYY");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				const errorMessage = screen.getByRole("alert");
				// Should be generic, not revealing if code exists
				expect(errorMessage.textContent).not.toMatch(
					/n'existe pas|introuvable|non trouvé/i,
				);
			});
		});
	});

	describe("Accessibility", () => {
		it("should have proper ARIA labels", () => {
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			const descriptionId = input.getAttribute("aria-describedby");
			expect(descriptionId).toBeTruthy();
			expect(
				document.getElementById(descriptionId as string),
			).toHaveTextContent("Format: XXXX-XXXX ou XXXX-XXXX-XXXX");
		});

		it("should have accessible paste button", () => {
			render(<SecretCodeLoginForm />);

			const pasteButton = screen.getByRole("button", {
				name: /coller le code depuis le presse-papiers/i,
			});
			expect(pasteButton).toHaveAttribute("aria-label");
		});

		it("should announce errors to screen readers", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({
				success: false,
				error: "Vérifiez votre code",
			});
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "FAKE-CODE");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				const errorAlert = screen.getByRole("alert");
				expect(errorAlert).toBeInTheDocument();
				expect(input).toHaveAttribute("aria-invalid", "true");
				expect(input.getAttribute("aria-describedby")?.split(" ")).toContain(
					errorAlert.id,
				);
			});
		});

		it("should have proper autocomplete attributes", () => {
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			expect(input).toHaveAttribute("autoComplete", "off");
			expect(input).toHaveAttribute("autoCapitalize", "characters");
		});
	});

	describe("Integration", () => {
		it("should call Better Auth with a sanitized code", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({ success: true, userId: "user_123" });
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "k7mn-p8qr");

			const submitButton = screen.getByRole("button", {
				name: /se connecter/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockSigninFn).toHaveBeenCalledWith({
					secretCode: "K7MN-P8QR",
				});
			});
		});

		it("should handle form submission via Enter key", async () => {
			const user = userEvent.setup();
			mockSigninFn.mockResolvedValue({ success: true, userId: "user_123" });
			render(<SecretCodeLoginForm />);

			const input = screen.getByLabelText("Code Secret");
			await user.type(input, "K7MN-P8QR{Enter}");

			await waitFor(() => {
				expect(mockSigninFn).toHaveBeenCalled();
			});
		});
	});
});
