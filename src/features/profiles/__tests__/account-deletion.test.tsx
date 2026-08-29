import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { AccountDeletion } from "../components/account-deletion";

// Mock dependencies
vi.mock("@/features/auth/lib/auth-client", () => ({
	authClient: {
		deleteUser: vi.fn(),
	},
}));

describe("AccountDeletion Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initial render", () => {
		it("should render the delete account button", () => {
			render(<AccountDeletion />);
			const button = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			expect(button).toBeInTheDocument();
		});

		it("should not show modal on initial render", () => {
			render(<AccountDeletion />);
			const modal =
				screen.queryByRole("dialog") || screen.queryByRole("alertdialog");
			expect(modal).not.toBeInTheDocument();
		});
	});

	describe("Two-step modal flow", () => {
		it("should open modal when delete button is clicked", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			const button = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(button);

			const modal = await screen.findByRole("alertdialog");
			expect(modal).toBeInTheDocument();
		});

		it("should show Step 1 with warnings, retention options, and confirmation checkbox", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			const button = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(button);

			// Check AlertDialogDescription specifically
			const description = screen
				.getByRole("alertdialog")
				.querySelector('[id="delete-account-description"]');
			expect(description).toHaveTextContent(/cette action est irréversible/i);

			// Check retention options are present
			expect(
				screen.getByLabelText(/anonymiser mes publications/i),
			).toBeInTheDocument();
			expect(
				screen.getByLabelText(/supprimer toutes mes publications/i),
			).toBeInTheDocument();

			// Check confirmation checkbox is present
			expect(screen.getByRole("checkbox")).toBeInTheDocument();
		});

		it("should enable continue button when confirmation checkbox is checked", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			const deleteButton = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(deleteButton);

			const checkbox = screen.getByRole("checkbox");
			const continueButton = screen.getByRole("button", {
				name: /continuer/i,
			});

			expect(continueButton).toBeDisabled();
			expect(checkbox).not.toBeChecked();

			await user.click(checkbox);

			// Wait for checkbox to be checked first
			await waitFor(() => {
				expect(checkbox).toBeChecked();
			});

			// Then wait for the button to be enabled
			await waitFor(() => {
				const button = screen.getByRole("button", {
					name: /continuer/i,
				});
				expect(button).toBeEnabled();
			});
		});

		it("should proceed to Step 2 (password confirmation) when continue is clicked", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			// Open modal
			const deleteButton = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(deleteButton);

			// Complete Step 1
			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			const continueButton = screen.getByRole("button", { name: /continuer/i });
			await user.click(continueButton);

			// Step 2 should appear
			const passwordInput =
				await screen.findByPlaceholderText(/\*\*\*\*\*\*\*\*/);
			expect(passwordInput).toBeInTheDocument();

			const confirmButton = screen.getByRole("button", {
				name: /confirmer la suppression/i,
			});
			expect(confirmButton).toBeInTheDocument();
			expect(confirmButton).toBeDisabled(); // Disabled until password entered
		});

		it("should enable confirm button when password is entered in Step 2", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			// Navigate to Step 2
			const deleteButton = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(deleteButton);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			const continueButton = screen.getByRole("button", { name: /continuer/i });
			await user.click(continueButton);

			// Enter password using placeholder since it's a PasswordInput component
			const passwordInput =
				await screen.findByPlaceholderText(/\*\*\*\*\*\*\*\*/);
			await user.type(passwordInput, "mySecurePassword123");

			await waitFor(() => {
				const confirmButton = screen.getByRole("button", {
					name: /confirmer la suppression/i,
				});
				expect(confirmButton).toBeEnabled();
			});
		});
	});

	describe("Cancellation flow", () => {
		it("should close modal when cancel button is clicked in Step 1", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			const deleteButton = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(deleteButton);

			const cancelButton = screen.getByRole("button", { name: /annuler/i });
			await user.click(cancelButton);

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
		});

		it("should go back to Step 1 when back button is clicked in Step 2", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			// Navigate to Step 2
			const deleteButton = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(deleteButton);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			const continueButton = screen.getByRole("button", { name: /continuer/i });
			await user.click(continueButton);

			// Wait for Step 2 to be fully rendered
			await waitFor(() => {
				expect(
					screen.getByPlaceholderText(/\*\*\*\*\*\*\*\*/),
				).toBeInTheDocument();
			});

			// Click back
			const backButton = screen.getByRole("button", { name: /retour/i });
			await user.click(backButton);

			// Should be back at Step 1
			await waitFor(() => {
				const description = screen
					.getByRole("alertdialog")
					.querySelector('[id="delete-account-description"]');
				expect(description).toHaveTextContent(/cette action est irréversible/i);
				expect(
					screen.queryByPlaceholderText(/\*\*\*\*\*\*\*\*/),
				).not.toBeInTheDocument();
			});
		});
	});

	describe("Accessibility", () => {
		it("should have proper ARIA attributes and keyboard navigation", async () => {
			const user = userEvent.setup();
			render(<AccountDeletion />);

			const deleteButton = screen.getByRole("button", {
				name: /supprimer le compte/i,
			});
			await user.click(deleteButton);

			const modal = await screen.findByRole("alertdialog");

			// Check that modal has proper ARIA labelledby attribute
			expect(modal).toHaveAttribute("aria-labelledby", "delete-account-title");
			expect(modal).toHaveAttribute(
				"aria-describedby",
				"delete-account-description",
			);

			// Check that the title and description are present
			expect(
				screen.getByText(/supprimer définitivement votre compte/i),
			).toBeInTheDocument();

			// Check that focus management works - modal content should be focusable
			const radioOptions = screen.getAllByRole("radio");
			expect(radioOptions).toHaveLength(2);
		});
	});
});
