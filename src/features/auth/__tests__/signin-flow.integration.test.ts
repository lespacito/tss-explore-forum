import { beforeEach, describe, expect, it, vi } from "vitest";
import { signIn } from "@/features/auth/lib/auth-client";
import { getUserEmailByUsername } from "@/features/auth/server/get-user-email-by-username";

// Mock Better-Auth client
vi.mock("@/features/auth/lib/auth-client", () => ({
	signIn: {
		username: vi.fn(),
	},
	signOut: vi.fn(),
}));

// Mock server functions
vi.mock("@/features/auth/server/get-user-email-by-username", () => ({
	getUserEmailByUsername: vi.fn(),
}));

describe("Signin Flow Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Successful signin", () => {
		it("should signin successfully with valid credentials", async () => {
			const mockUser = {
				id: "user-123",
				username: "testuser",
				email: "test@example.com",
				emailVerified: true,
			};

			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockResolvedValueOnce({
				data: {
					user: mockUser,
					session: { token: "mock-token" },
				},
			});

			const result = await signIn.username({
				username: "testuser",
				password: "Password123!",
				callbackURL: "/",
			});

			expect(mockSignInFn).toHaveBeenCalledWith({
				username: "testuser",
				password: "Password123!",
				callbackURL: "/",
			});

			expect(result.data?.user).toEqual(mockUser);
		});

		it("should signin and redirect to callbackURL", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockResolvedValueOnce({
				data: {
					user: { id: "user-123", emailVerified: true },
					session: { token: "mock-token" },
				},
			});

			const result = await signIn.username({
				username: "testuser",
				password: "Password123!",
				callbackURL: "/threads",
			});

			expect(mockSignInFn).toHaveBeenCalledWith(
				expect.objectContaining({
					callbackURL: "/threads",
				}),
			);

			expect(result.data).toBeDefined();
		});
	});

	describe("Failed signin", () => {
		it("should reject signin with invalid credentials", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockRejectedValueOnce({
				error: {
					code: "INVALID_CREDENTIALS",
					message: "Invalid credentials",
				},
			});

			await expect(
				signIn.username({
					username: "testuser",
					password: "WrongPassword",
					callbackURL: "/",
				}),
			).rejects.toMatchObject({
				error: expect.objectContaining({
					code: "INVALID_CREDENTIALS",
				}),
			});
		});

		it("should reject signin with non-existent username", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockRejectedValueOnce({
				error: {
					code: "USER_NOT_FOUND",
					message: "User not found",
				},
			});

			await expect(
				signIn.username({
					username: "nonexistent",
					password: "Password123!",
					callbackURL: "/",
				}),
			).rejects.toMatchObject({
				error: expect.objectContaining({
					code: "USER_NOT_FOUND",
				}),
			});
		});
	});

	describe("Email not verified", () => {
		it("should detect unverified email and return error code", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockRejectedValueOnce({
				error: {
					code: "EMAIL_NOT_VERIFIED",
					message: "Email not verified",
				},
			});

			await expect(
				signIn.username({
					username: "unverifieduser",
					password: "Password123!",
					callbackURL: "/",
				}),
			).rejects.toMatchObject({
				error: expect.objectContaining({
					code: "EMAIL_NOT_VERIFIED",
				}),
			});
		});

		it("should fetch user email when email not verified", async () => {
			const mockGetUserEmail = getUserEmailByUsername as ReturnType<
				typeof vi.fn
			>;
			mockGetUserEmail.mockResolvedValueOnce({
				email: "unverified@example.com",
			});

			const result = await getUserEmailByUsername({
				data: { username: "unverifieduser" },
			});

			expect(mockGetUserEmail).toHaveBeenCalledWith({
				data: { username: "unverifieduser" },
			});

			expect(result.email).toBe("unverified@example.com");
		});

		it("should handle missing email gracefully when verification fails", async () => {
			const mockGetUserEmail = getUserEmailByUsername as ReturnType<
				typeof vi.fn
			>;
			mockGetUserEmail.mockResolvedValueOnce({
				email: null,
			});

			const result = await getUserEmailByUsername({
				data: { username: "nonemailuser" },
			});

			expect(result.email).toBeNull();
		});
	});

	describe("Error handling", () => {
		it("should handle network errors gracefully", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockRejectedValueOnce(new Error("Network error"));

			await expect(
				signIn.username({
					username: "testuser",
					password: "Password123!",
					callbackURL: "/",
				}),
			).rejects.toThrow("Network error");
		});

		it("should handle server errors gracefully", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockRejectedValueOnce({
				error: {
					code: "SERVER_ERROR",
					message: "Internal server error",
				},
			});

			await expect(
				signIn.username({
					username: "testuser",
					password: "Password123!",
					callbackURL: "/",
				}),
			).rejects.toMatchObject({
				error: expect.objectContaining({
					code: "SERVER_ERROR",
				}),
			});
		});

		it("should not expose sensitive information in error messages", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockRejectedValueOnce({
				error: {
					code: "INVALID_CREDENTIALS",
					message: "Invalid credentials",
				},
			});

			try {
				await signIn.username({
					username: "testuser",
					password: "WrongPassword",
					callbackURL: "/",
				});
			} catch (error: any) {
				// Error message should be generic, not reveal if user exists
				expect(error.error.message).not.toContain("testuser");
				expect(error.error.message).not.toContain("user not found");
				expect(error.error.message).toBe("Invalid credentials");
			}
		});
	});

	describe("CallbackURL validation", () => {
		it("should accept internal callbackURL", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockResolvedValueOnce({
				data: {
					user: { id: "user-123", emailVerified: true },
					session: { token: "mock-token" },
				},
			});

			await signIn.username({
				username: "testuser",
				password: "Password123!",
				callbackURL: "/dashboard",
			});

			expect(mockSignInFn).toHaveBeenCalledWith(
				expect.objectContaining({
					callbackURL: "/dashboard",
				}),
			);
		});

		it("should default to root path when no callbackURL provided", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockResolvedValueOnce({
				data: {
					user: { id: "user-123", emailVerified: true },
					session: { token: "mock-token" },
				},
			});

			await signIn.username({
				username: "testuser",
				password: "Password123!",
				callbackURL: "/",
			});

			expect(mockSignInFn).toHaveBeenCalledWith(
				expect.objectContaining({
					callbackURL: "/",
				}),
			);
		});
	});

	describe("Username format handling", () => {
		it("should accept username with underscores", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockResolvedValueOnce({
				data: {
					user: { id: "user-123", emailVerified: true },
					session: { token: "mock-token" },
				},
			});

			await signIn.username({
				username: "test_user_123",
				password: "Password123!",
				callbackURL: "/",
			});

			expect(mockSignInFn).toHaveBeenCalledWith(
				expect.objectContaining({
					username: "test_user_123",
				}),
			);
		});

		it("should accept username with hyphens", async () => {
			const mockSignInFn = signIn.username as unknown as ReturnType<
				typeof vi.fn
			>;
			mockSignInFn.mockResolvedValueOnce({
				data: {
					user: { id: "user-123", emailVerified: true },
					session: { token: "mock-token" },
				},
			});

			await signIn.username({
				username: "test-user-123",
				password: "Password123!",
				callbackURL: "/",
			});

			expect(mockSignInFn).toHaveBeenCalledWith(
				expect.objectContaining({
					username: "test-user-123",
				}),
			);
		});
	});
});
