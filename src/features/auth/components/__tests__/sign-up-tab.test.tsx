import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { SignUpTab } from "../sign-up-tab";
import * as authClient from "@/features/auth/lib/auth-client";
import * as sendWelcomeEmailFn from "@/features/auth/server/send-welcome-email";

// Mock dependencies
vi.mock("@/features/auth/lib/auth-client", () => ({
  signUp: {
    email: vi.fn(),
  },
}));

vi.mock("@/features/auth/server/send-welcome-email", () => ({
  sendWelcomeEmailFn: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/logger/client-logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("SignUpTab Component - Task 8 Subtask 8.4", () => {
  const mockOpenEmailVerificationTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render all form fields", () => {
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      // Use more specific queries to avoid conflicts
      expect(
        screen.getByRole("textbox", { name: /^nom$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /email/i }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it("should render submit and cancel buttons", () => {
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      expect(
        screen.getByRole("button", { name: /s'inscrire/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /annuler/i }),
      ).toBeInTheDocument();
    });

    it("should have submit button disabled initially", () => {
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("User Input and Validation", () => {
    it("should enable submit button when all fields are filled", async () => {
      const user = userEvent.setup();
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const nameInput = screen.getByRole("textbox", { name: /^nom$/i });
      const usernameInput = screen.getByRole("textbox", {
        name: /nom d'utilisateur/i,
      });
      const displayUsernameInput = screen.getByRole("textbox", {
        name: /nom d'affichage/i,
      });
      const emailInput = screen.getByRole("textbox", { name: /email/i });
      const passwordInput = screen.getByLabelText(/mot de passe/i);

      await user.type(nameInput, "Jean Dupont");
      await user.type(usernameInput, "jeandupont");
      await user.type(displayUsernameInput, "Jean D.");
      await user.type(emailInput, "jean@example.com");
      await user.type(passwordInput, "SecurePass123");

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /s'inscrire/i,
        });
        expect(submitButton).toBeEnabled();
      });
    });

    it("should show validation error for invalid email", async () => {
      const user = userEvent.setup();
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const emailInput = screen.getByRole("textbox", { name: /email/i });
      await user.type(emailInput, "invalid-email");
      await user.tab(); // Trigger blur for validation

      await waitFor(() => {
        expect(screen.getByText(/email invalide/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for short password", async () => {
      const user = userEvent.setup();
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const passwordInput = screen.getByLabelText(/mot de passe/i);
      await user.type(passwordInput, "12345");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/au moins 6 caractères/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call signUp.email with correct data on submit", async () => {
      const user = userEvent.setup();
      const mockSignUp = vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", emailVerified: false } },
        error: null,
      });
      vi.mocked(authClient.signUp.email).mockImplementation(mockSignUp);
      vi.mocked(sendWelcomeEmailFn.sendWelcomeEmailFn).mockResolvedValue({
        success: true,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      await user.type(
        screen.getByRole("textbox", { name: /^nom$/i }),
        "Jean Dupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "jeandupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "jean@example.com",
      );
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Jean Dupont",
            username: "jeandupont",
            displayUsername: "Jean D.",
            email: "jean@example.com",
            password: "SecurePass123",
            callbackURL: "/",
          }),
          expect.any(Object),
        );
      });
    });

    it("should send welcome email after successful signup", async () => {
      const user = userEvent.setup();
      const mockSendWelcomeEmail = vi.fn().mockResolvedValue({ success: true });
      vi.mocked(sendWelcomeEmailFn.sendWelcomeEmailFn).mockImplementation(
        mockSendWelcomeEmail,
      );

      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: { user: { id: "user-1", emailVerified: false } },
        error: null,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      await user.type(
        screen.getByRole("textbox", { name: /^nom$/i }),
        "Jean Dupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "jeandupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "jean@example.com",
      );
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
          data: {
            email: "jean@example.com",
            name: "Jean Dupont",
          },
        });
      });
    });

    it("should open email verification tab when email is not verified", async () => {
      const user = userEvent.setup();
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: { user: { id: "user-1", emailVerified: false } },
        error: null,
      });
      vi.mocked(sendWelcomeEmailFn.sendWelcomeEmailFn).mockResolvedValue({
        success: true,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      await user.type(
        screen.getByRole("textbox", { name: /^nom$/i }),
        "Jean Dupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "jeandupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "jean@example.com",
      );
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOpenEmailVerificationTab).toHaveBeenCalledWith(
          "jean@example.com",
        );
      });
    });

    it("should reset form after successful submission", async () => {
      const user = userEvent.setup();
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: { user: { id: "user-1", emailVerified: false } },
        error: null,
      });
      vi.mocked(sendWelcomeEmailFn.sendWelcomeEmailFn).mockResolvedValue({
        success: true,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const nameInput = screen.getByRole("textbox", {
        name: /^nom$/i,
      }) as HTMLInputElement;
      const emailInput = screen.getByRole("textbox", {
        name: /email/i,
      }) as HTMLInputElement;

      await user.type(nameInput, "Jean Dupont");
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "jeandupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(emailInput, "jean@example.com");
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe("");
        expect(emailInput.value).toBe("");
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message for duplicate email", async () => {
      const user = userEvent.setup();
      const mockError = new Error("Email already exists");
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: null,
        error: mockError,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      await user.type(
        screen.getByRole("textbox", { name: /^nom$/i }),
        "Jean Dupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "jeandupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "existing@example.com",
      );
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email.*déjà.*utilisé/i)).toBeInTheDocument();
      });
    });

    it("should display error message for duplicate username", async () => {
      const user = userEvent.setup();
      const mockError = new Error("Username already exists");
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: null,
        error: mockError,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      await user.type(
        screen.getByRole("textbox", { name: /^nom$/i }),
        "Jean Dupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "existinguser",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "jean@example.com",
      );
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/nom d'utilisateur.*déjà.*pris/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle generic errors gracefully", async () => {
      const user = userEvent.setup();
      const mockError = new Error("Network error");
      vi.mocked(authClient.signUp.email).mockResolvedValue({
        data: null,
        error: mockError,
      });

      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      await user.type(
        screen.getByRole("textbox", { name: /^nom$/i }),
        "Jean Dupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
        "jeandupont",
      );
      await user.type(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
        "Jean D.",
      );
      await user.type(
        screen.getByRole("textbox", { name: /email/i }),
        "jean@example.com",
      );
      await user.type(screen.getByLabelText(/mot de passe/i), "SecurePass123");

      const submitButton = screen.getByRole("button", { name: /s'inscrire/i });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await user.click(submitButton);

      await waitFor(() => {
        // Component should not crash and error should be logged
        expect(
          screen.getByRole("button", { name: /s'inscrire/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Cancel Button", () => {
    it("should reset form when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const nameInput = screen.getByRole("textbox", {
        name: /^nom$/i,
      }) as HTMLInputElement;
      const emailInput = screen.getByRole("textbox", {
        name: /email/i,
      }) as HTMLInputElement;

      await user.type(nameInput, "Jean Dupont");
      await user.type(emailInput, "jean@example.com");

      const cancelButton = screen.getByRole("button", { name: /annuler/i });
      await user.click(cancelButton);

      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
    });

    it("should have cancel button disabled when form is pristine", () => {
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const cancelButton = screen.getByRole("button", { name: /annuler/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for all inputs", () => {
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      expect(
        screen.getByRole("textbox", { name: /^nom$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /nom d'utilisateur/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /nom d'affichage/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /email/i }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it("should mark invalid fields with aria-invalid", async () => {
      const user = userEvent.setup();
      render(
        <SignUpTab openEmailVerificationTab={mockOpenEmailVerificationTab} />,
      );

      const emailInput = screen.getByRole("textbox", { name: /email/i });
      await user.type(emailInput, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });
});
