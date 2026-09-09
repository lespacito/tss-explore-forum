import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnonymousPostButton } from "../AnonymousPostButton";

// Mock the router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	getRouteApi: () => ({
		useLoaderData: () => ({ beta: { submissionsOpen: true } }),
	}),
	useRouter: () => ({
		navigate: mockNavigate,
		invalidate: vi.fn(),
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
		vi.resetAllMocks();
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
		it.each(["loading text", "disabled button"])(
			"shows %s until the request completes",
			async (state) => {
				const { createAnonymousSessionFn } = await import(
					"@/features/auth/server/create-anonymous-session"
				);
				let finish!: () => void;
				const pending = new Promise<{ success: true; userId: string }>(
					(resolve) => {
						finish = () => resolve({ success: true, userId: "test-id" });
					},
				);
				vi.mocked(createAnonymousSessionFn).mockReturnValue(pending);
				render(<AnonymousPostButton />);
				const button = screen.getByRole("button");
				fireEvent.click(button);
				try {
					if (state === "loading text")
						expect(button.textContent).toContain("Chargement");
					else expect(button.getAttribute("disabled")).not.toBeNull();
					expect(mockNavigate).not.toHaveBeenCalled();
				} finally {
					// Finish the handler while jsdom still exists, including on assertion failure.
					await act(async () => {
						finish();
						await pending;
					});
				}
				expect(mockNavigate).toHaveBeenCalledWith({ to: "/threads/new" });
				expect(button.textContent).not.toContain("Chargement");
				expect(button.getAttribute("disabled")).toBeNull();
			},
		);
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
			await act(async () => {
				fireEvent.click(button);
			});

			await waitFor(() => {
				expect(createAnonymousSessionFn).toHaveBeenCalled();
			});
		});

		it("should navigate to the guided publication flow on success", async () => {
			const { createAnonymousSessionFn } = await import(
				"@/features/auth/server/create-anonymous-session"
			);

			vi.mocked(createAnonymousSessionFn).mockResolvedValue({
				success: true,
				userId: "test-user-id",
			});

			render(<AnonymousPostButton />);

			const button = screen.getByRole("button");
			await act(async () => {
				fireEvent.click(button);
			});

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith({
					to: "/threads/new",
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
			await act(async () => {
				fireEvent.click(button);
			});

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
			await act(async () => {
				fireEvent.click(button);
			});

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
			await act(async () => {
				fireEvent.click(button);
			});

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
			await act(async () => {
				fireEvent.click(button);
			});

			await waitFor(() => {
				expect(button.textContent).not.toContain("Chargement");
				expect(button.getAttribute("disabled")).toBeNull();
			});
		});
	});
});
