import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthContext } from "@/features/auth/server/get-auth-session";

/**
 * Test Suite: Route Protection for /threads/new
 * Coverage: AC4 - Protected route with authentication verification
 */

vi.mock("@/features/auth/components/AnonymousPostButton", () => ({
	AnonymousPostButton: () => null,
}));
const mockGetAuthSession = vi.fn();
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: () => mockGetAuthSession(),
}));

describe("Route Protection: /threads/new/", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("lets invited visitors reach the session creation step", async () => {
		const session = { user: null, isAuthenticated: false, session: null };
		mockGetAuthSession.mockResolvedValue(session);
		const { Route } = await import("../index.tsx");
		expect(await Route.options.loader?.()).toEqual({ session });
		expect(mockGetAuthSession).toHaveBeenCalledOnce();
	});

	describe("Subtask 1.6: Anonymous user → allow access", () => {
		it("should allow access when user is anonymous (isAnonymous: true)", async () => {
			const anonymousSession = {
				user: {
					id: "anon-user-1",
					email: "",
					name: "",
					emailVerified: false,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: null,
					displayUsername: null,
					role: "USER",
					isAnonymous: true,
					bio: null,
					banned: false,
					secretCode: null,
					secretCodeGeneratedAt: null,
				},
				isAuthenticated: true,
				session: {
					id: "session-123",
					userId: "anon-user-1",
					expiresAt: new Date(Date.now() + 86400000),
					token: "token-123",
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: "127.0.0.1",
					userAgent: "test-agent",
				},
			} satisfies AuthContext;
			mockGetAuthSession.mockResolvedValue(anonymousSession);

			const { Route } = await import("../index.tsx");
			const loader = Route.options.loader;
			const result = await loader?.();

			expect(result).toEqual({ session: anonymousSession });
			expect(mockGetAuthSession).toHaveBeenCalledOnce();
		});
	});

	describe("Subtask 1.7: Registered user → allow access", () => {
		it("should allow access when user is registered (isAnonymous: false)", async () => {
			const registeredSession = {
				user: {
					id: "reg-user-1",
					email: "user@example.com",
					name: "Test User",
					emailVerified: true,
					image: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					username: null,
					displayUsername: null,
					role: "USER",
					isAnonymous: false,
					bio: null,
					banned: false,
					secretCode: null,
					secretCodeGeneratedAt: null,
				},
				isAuthenticated: true,
				session: {
					id: "session-456",
					userId: "reg-user-1",
					expiresAt: new Date(Date.now() + 86400000),
					token: "token-456",
					createdAt: new Date(),
					updatedAt: new Date(),
					ipAddress: "127.0.0.1",
					userAgent: "test-agent",
				},
			} satisfies AuthContext;
			mockGetAuthSession.mockResolvedValue(registeredSession);

			const { Route } = await import("../index.tsx");
			const loader = Route.options.loader;
			const result = await loader?.();

			expect(result).toEqual({ session: registeredSession });
			expect(mockGetAuthSession).toHaveBeenCalledOnce();
		});
	});
});
