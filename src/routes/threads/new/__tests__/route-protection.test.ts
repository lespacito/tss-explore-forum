import { redirect } from "@tanstack/react-router";
import type { Session, User } from "better-auth/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Test Suite: Route Protection for /threads/new
 * Coverage: AC4 - Protected route with authentication verification
 */

// Mock getAuthSession
const mockGetAuthSession = vi.fn();
vi.mock("@/features/auth/lib/auth", () => ({
	getAuthSession: () => mockGetAuthSession(),
}));

describe("Route Protection: /threads/new/", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Subtask 1.5: Unauthenticated user → redirect to login", () => {
		it("should redirect to /auth/login when no session exists", async () => {
			// Arrange: No session
			mockGetAuthSession.mockResolvedValue(null);

			// Act & Assert: Should redirect
			// This test validates the loader will throw a redirect
			const { Route } = await import("../index.tsx");
			const loader = Route.options.loader;

			if (!loader) {
				throw new Error("Loader not defined on route");
			}

			await expect(loader()).rejects.toThrowError();

			// Verify getAuthSession was called
			expect(mockGetAuthSession).toHaveBeenCalledOnce();
		});

		it("should include redirect search param pointing back to /threads/new", async () => {
			// Arrange
			mockGetAuthSession.mockResolvedValue(null);

			// Act & Assert
			const { Route } = await import("../index.tsx");
			const loader = Route.options.loader;

			try {
				await loader?.();
				// Should not reach here
				expect.fail("Expected redirect to be thrown");
			} catch (error: unknown) {
				// TanStack Router redirect() returns a Response object with options
				expect(error).toHaveProperty("options");
				const redirectError = error as {
					options: { to: string; search: { redirect: string } };
				};
				expect(redirectError.options.to).toBe("/auth/login");
				expect(redirectError.options.search.redirect).toBe("/threads/new");
			}
		});
	});

	describe("Subtask 1.6: Anonymous user → allow access", () => {
		it("should allow access when user is anonymous (isAnonymous: true)", async () => {
			// Arrange: Anonymous session
			const anonymousSession: { session: Session; user: User } = {
				session: {
					id: "session-123",
					userId: "anon-user-1",
					expiresAt: new Date(Date.now() + 86400000),
					token: "token-123",
					ipAddress: "127.0.0.1",
					userAgent: "test-agent",
				},
				user: {
					id: "anon-user-1",
					email: "",
					name: "",
					emailVerified: false,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					isAnonymous: true,
					secretCode: null,
					secretCodeGeneratedAt: null,
				},
			};
			mockGetAuthSession.mockResolvedValue(anonymousSession);

			// Act
			const { Route } = await import("../index.tsx");
			const loader = Route.options.loader;
			const result = await loader?.();

			// Assert: No error thrown, session returned
			expect(result).toEqual({ session: anonymousSession });
			expect(mockGetAuthSession).toHaveBeenCalledOnce();
		});
	});

	describe("Subtask 1.7: Registered user → allow access", () => {
		it("should allow access when user is registered (isAnonymous: false)", async () => {
			// Arrange: Registered user session
			const registeredSession: { session: Session; user: User } = {
				session: {
					id: "session-456",
					userId: "reg-user-1",
					expiresAt: new Date(Date.now() + 86400000),
					token: "token-456",
					ipAddress: "127.0.0.1",
					userAgent: "test-agent",
				},
				user: {
					id: "reg-user-1",
					email: "user@example.com",
					name: "Test User",
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					isAnonymous: false,
					secretCode: null,
					secretCodeGeneratedAt: null,
				},
			};
			mockGetAuthSession.mockResolvedValue(registeredSession);

			// Act
			const { Route } = await import("../index.tsx");
			const loader = Route.options.loader;
			const result = await loader?.();

			// Assert: No error thrown, session returned
			expect(result).toEqual({ session: registeredSession });
			expect(mockGetAuthSession).toHaveBeenCalledOnce();
		});
	});
});
