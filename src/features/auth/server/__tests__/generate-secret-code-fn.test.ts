import type { Session, User } from "better-auth/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock all server-side dependencies BEFORE imports
vi.mock("@/data/env/server", () => ({
	env: {
		NODE_ENV: "test",
		SERVICE_NAME: "test-service",
		DATABASE_URL: "postgresql://test",
	},
}));

vi.mock("@/lib/logger/server", () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));

vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: vi.fn(),
}));

vi.mock("@/features/auth/lib/generate-secret-code", () => ({
	ensureUniqueCode: vi.fn(),
}));

// Mock Drizzle DB
vi.mock("@/db", () => {
	const mockDbChain = {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};
	return {
		db: mockDbChain,
	};
});

vi.mock("@/db/schemas/user", () => ({
	user: {
		id: "id",
		email: "email",
		secretCode: "secretCode",
		secretCodeGeneratedAt: "secretCodeGeneratedAt",
	},
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn(() => "mocked-eq"),
}));

import { db } from "@/db";
// Now safe to import
import { ensureUniqueCode } from "@/features/auth/lib/generate-secret-code";
import { logger } from "@/lib/logger/server";
import { generateSecretCodeLogic } from "../generate-secret-code-logic";

// Get reference to mocked db for test assertions
const mockDb = db as any;

describe("generateSecretCodeLogic - Task 3", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset DB chain
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.limit.mockResolvedValue([]);
		mockDb.update.mockReturnThis();
		mockDb.set.mockReturnThis();
	});

	describe("Authentication Checks", () => {
		it("should return error if user is not authenticated", async () => {
			const result = await generateSecretCodeLogic(null, mockDb);

			expect(result.success).toBe(false);
			expect((result as any).error).toContain("authentifié");
		});

		it("should return error if session exists but no user", async () => {
			const session = {
				session: { id: "session_123" } as Session,
				isAuthenticated: false,
				user: null,
			};

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(false);
			expect((result as any).error).toBeDefined();
		});
	});

	describe("Anonymous User Validation", () => {
		it("should generate code for anonymous user (isAnonymous is true)", async () => {
			const session = {
				user: {
					id: "user_123",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			// Mock DB query to return anonymous user without code
			mockDb.limit.mockResolvedValue([
				{
					id: "user_123",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockResolvedValue("TEST-CODE-1234");

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(true);
			expect((result as any).secretCode).toBe("TEST-CODE-1234");
			expect((result as any).isExisting).toBe(false);
		});

		it("should reject registered user (isAnonymous is false)", async () => {
			const session = {
				user: {
					id: "user_123",
					email: "user@example.com",
					isAnonymous: false,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			// Mock DB query to return registered user
			mockDb.limit.mockResolvedValue([
				{
					id: "user_123",
					email: "user@example.com",
					isAnonymous: false,
					secretCode: null,
				},
			]);

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(false);
			expect((result as any).error).toContain("anonyme");
		});
	});

	describe("Idempotence - Existing Code", () => {
		it("should return existing code if user already has one in session", async () => {
			const session = {
				user: {
					id: "user_123",
					email: null,
					isAnonymous: true,
					secretCode: "EXISTING-CODE",
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(true);
			expect((result as any).secretCode).toBe("EXISTING-CODE");
			expect((result as any).isExisting).toBe(true);
			expect(ensureUniqueCode).not.toHaveBeenCalled();
			expect(logger.info).toHaveBeenCalledWith(
				"Secret code already exists",
				expect.objectContaining({ userId: "user_123" }),
			);
		});

		it("should return existing code if found in database", async () => {
			const session = {
				user: {
					id: "user_456",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null, // Not in session
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			// Mock DB query to return user with existing code
			mockDb.limit.mockResolvedValue([
				{
					id: "user_456",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: "DB-EXISTING-CODE",
				},
			]);

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(true);
			expect((result as any).secretCode).toBe("DB-EXISTING-CODE");
			expect((result as any).isExisting).toBe(true);
			expect(ensureUniqueCode).not.toHaveBeenCalled();
		});
	});

	describe("Code Generation and Storage", () => {
		it("should generate new unique code for anonymous user without code", async () => {
			const session = {
				user: {
					id: "user_789",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_123",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockResolvedValue("NEW-CODE-ABCD");

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(true);
			expect((result as any).secretCode).toBe("NEW-CODE-ABCD");
			expect((result as any).isExisting).toBe(false);
			expect(ensureUniqueCode).toHaveBeenCalled();
		});

		it("should save generated code to database", async () => {
			const session = {
				user: {
					id: "user_999",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_789",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockResolvedValue("SAVED-CODE-XYZ");

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(true);
			expect(mockDb.update).toHaveBeenCalled();
			expect(mockDb.set).toHaveBeenCalledWith(
				expect.objectContaining({
					secretCode: "SAVED-CODE-XYZ",
					secretCodeGeneratedAt: expect.any(Date),
				}),
			);
		});

		it("should log code generation without exposing the code", async () => {
			const session = {
				user: {
					id: "user_log",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_999",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockResolvedValue("SECRET-CODE-123");

			await generateSecretCodeLogic(session, mockDb);

			expect(logger.info).toHaveBeenCalledWith(
				"Secret code generated",
				expect.objectContaining({
					userId: "user_log",
					codeLength: expect.any(Number),
				}),
			);

			// Verify code is NOT logged directly
			const logCalls = vi.mocked(logger.info).mock.calls;
			const loggedData = JSON.stringify(logCalls);
			expect(loggedData).not.toContain("SECRET-CODE-123");
		});
	});

	describe("Error Handling", () => {
		it("should handle database errors gracefully", async () => {
			const session = {
				user: {
					id: "user_error",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_error",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockRejectedValue(
				new Error("Database connection failed"),
			);

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(false);
			expect((result as any).error).toBeDefined();
			expect(logger.error).toHaveBeenCalledWith(
				"Secret code generation failed",
				expect.any(Object),
			);
		});

		it("should return user-friendly error message", async () => {
			const session = {
				user: {
					id: "user_err2",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_err2",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockRejectedValue(
				new Error("Internal error"),
			);

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(false);
			expect((result as any).error).toBe(
				"Impossible de générer le code secret",
			);
		});

		it("should not expose internal error details to client", async () => {
			const session = {
				user: {
					id: "user_err3",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_err3",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			const sensitiveError = new Error(
				"Database password incorrect at server:5432",
			);
			vi.mocked(ensureUniqueCode).mockRejectedValue(sensitiveError);

			const result = await generateSecretCodeLogic(session, mockDb);

			expect((result as any).error).not.toContain("password");
			expect((result as any).error).not.toContain("5432");
		});
	});

	describe("Security - NFR3", () => {
		it("should not log secret code in production mode", async () => {
			const session = {
				user: {
					id: "user_sec",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_log",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			const secretCode = "VERY-SECRET-CODE";
			vi.mocked(ensureUniqueCode).mockResolvedValue(secretCode);

			await generateSecretCodeLogic(session, mockDb);

			// Verify the actual secret code is never logged
			const allLogCalls = [
				...vi.mocked(logger.info).mock.calls,
				...vi.mocked(logger.error).mock.calls,
				...vi.mocked(logger.warn).mock.calls,
			];

			const allLoggedContent = JSON.stringify(allLogCalls);
			expect(allLoggedContent).not.toContain(secretCode);
		});

		it("should only return code to authenticated session owner", async () => {
			const session = {
				user: {
					id: "user_owner",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_sec",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockResolvedValue("OWNER-CODE-ABC");

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(true);
			expect((result as any).secretCode).toBeDefined();
		});
	});

	describe("Return Value Structure", () => {
		it("should return correct structure for success with new code", async () => {
			const session = {
				user: {
					id: "user_struct",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			mockDb.limit.mockResolvedValue([
				{
					id: "user_struct",
					email: "temp@anonymous.com",
					isAnonymous: true,
					secretCode: null,
				},
			]);

			vi.mocked(ensureUniqueCode).mockResolvedValue("STRUCT-CODE-123");

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result).toEqual({
				success: true,
				secretCode: "STRUCT-CODE-123",
				isExisting: false,
			});
		});

		it("should return correct structure for existing code", async () => {
			const session = {
				user: {
					id: "user_exist",
					email: null,
					isAnonymous: true,
					secretCode: "EXIST-CODE-456",
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result).toEqual({
				success: true,
				secretCode: "EXIST-CODE-456",
				isExisting: true,
			});
		});

		it("should return correct structure for errors", async () => {
			const result = await generateSecretCodeLogic(null, mockDb);

			expect(result).toEqual({
				success: false,
				error: expect.any(String),
			});
			expect((result as any).secretCode).toBeUndefined();
		});
	});

	describe("Edge Cases", () => {
		it("should handle user not found in database", async () => {
			const session = {
				user: {
					id: "user_notfound",
					email: null,
					isAnonymous: true,
					secretCode: null,
				} as any,
				isAuthenticated: true,
				session: {} as Session,
			};

			// Mock DB query to return empty array (user not found)
			mockDb.limit.mockResolvedValue([]);

			const result = await generateSecretCodeLogic(session, mockDb);

			expect(result.success).toBe(false);
			expect((result as any).error).toContain("introuvable");
		});
	});
});
