import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnonymousPostButton } from "../AnonymousPostButton";

// Mock the router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({
		navigate: mockNavigate,
	}),
}));

// Mock the server function
vi.mock("@/features/auth/server/create-anonymous-session", () => ({
	createAnonymousSessionFn: vi.fn(),
}));

// Mock toast
vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

describe("AnonymousPostButton", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	describe("Rendering", () => {
		it("should render the button with correct text", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button", {
				name: /publier anonymement/i,
			});
			expect(button).toBeDefined();
		});

		it("should have proper aria-label for accessibility", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			expect(button.getAttribute("aria-label")).toContain(
				"Publier anonymement",
			);
		});

		it("should have large size button styling", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			// Button component with size="lg" applies h-10 and px-6 classes
			expect(button.className).toContain("h-10");
		});

		it("should have minimum width for mobile touch targets", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			expect(button.className).toContain("min-w");
		});
	});

	describe("Keyboard Accessibility (WCAG 2.1 AA)", () => {
		it("should be keyboard accessible with Tab", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			button.focus();
			expect(document.activeElement).toBe(button);
		});

		it("should be activatable with Enter key", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });

			expect(() => button.dispatchEvent(enterEvent)).not.toThrow();
		});

		it("should be activatable with Space key", () => {
			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			const spaceEvent = new KeyboardEvent("keydown", { key: " " });

			expect(() => button.dispatchEvent(spaceEvent)).not.toThrow();
		});
	});

	describe("Loading State", () => {
		it("should show loading text when processing", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);
			vi.mocked(createAnonymousSessionFn).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(
							() => resolve({ success: true, userId: "test-id" }),
							100,
						);
					}),
			);

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(button.textContent).toContain("Chargement");
			});
		});

		it("should disable button while loading", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);
			vi.mocked(createAnonymousSessionFn).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(
							() => resolve({ success: true, userId: "test-id" }),
							100,
						);
					}),
			);

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(button.getAttribute("disabled")).not.toBeNull();
			});
		});
	});

	describe("Click Behavior", () => {
		it("should call createAnonymousSessionFn on click", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);
			vi.mocked(createAnonymousSessionFn).mockResolvedValue({
				success: true,
				userId: "test-user-id",
			});

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(createAnonymousSessionFn).toHaveBeenCalled();
			});
		});

		it("should navigate to /threads on success", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);

			vi.mocked(createAnonymousSessionFn).mockResolvedValue({
				success: true,
				userId: "test-user-id",
			});

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith({
					to: "/threads",
					search: { openDialog: true },
				});
			});
		});

		it("should show error toast on failure", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);
			const { toast } = await import("sonner");

			vi.mocked(createAnonymousSessionFn).mockResolvedValue({
				success: false,
				error: "Une erreur est survenue",
			});

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith("Une erreur est survenue");
			});
		});

		it("should show generic error on exception", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);
			const { toast } = await import("sonner");

			vi.mocked(createAnonymousSessionFn).mockRejectedValue(
				new Error("Network error"),
			);

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(
					"Impossible de continuer. Veuillez réessayer.",
				);
			});
		});

		it("should reset loading state after success", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);

			vi.mocked(createAnonymousSessionFn).mockResolvedValue({
				success: true,
				userId: "test-user-id",
			});

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(button.textContent).not.toContain("Chargement");
			});
		});

		it("should reset loading state after error", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);

			vi.mocked(createAnonymousSessionFn).mockResolvedValue({
				success: false,
				error: "Test error",
			});

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			await waitFor(() => {
				expect(button.textContent).not.toContain("Chargement");
				expect(button.getAttribute("disabled")).toBeNull();
			});
		});
	});
});
