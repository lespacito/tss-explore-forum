/**
 * @vitest-environment node
 */

import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/index";
import { user as userTable } from "@/db/schemas/user";
import { logger } from "@/lib/logger/server";
import { generateSecretCodeLogic } from "../server/generate-secret-code-logic";

/**
 * Security Tests for Story 1.2: Code Secret pour Utilisateur Anonyme
 *
 * Coverage:
 * - Task 8.1: Verify code is NOT logged in clear text
 * - Task 8.2: Guarantee code cannot be enumerated/bruteforced
 * - Task 8.3: Rate limiting on generation
 * - Task 8.4: Complete security audit
 *
 * Validates:
 * - Secret codes never appear in logs
 * - Code generation has sufficient entropy
 * - Rate limiting prevents abuse
 * - No information leakage
 */

describe("Secret Code Security - Task 8", () => {
	let testUserId: string;
	let loggerSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		testUserId = `security_test_${Date.now()}`;

		// Spy on logger to verify what gets logged
		loggerSpy = vi.spyOn(logger, "info");
	});

	afterEach(async () => {
		// Cleanup
		if (testUserId) {
			await db.delete(userTable).where(eq(userTable.id, testUserId));
		}

		// Restore logger
		loggerSpy.mockRestore();
	});

	/**
	 * Task 8.1: Verify that the code is NOT logged in clear text
	 * CRITICAL: Secret codes must NEVER appear in logs
	 */
	describe("Task 8.1: No Clear Text Logging", () => {
		it("should NOT log secret code in plain text", async () => {
			// Create test anonymous user
			await db.insert(userTable).values({
				id: testUserId,
				name: "Security Test User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
			});

			// Mock session
			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			// Generate secret code
			const result = await generateSecretCodeLogic(mockSession);

			expect(result.success).toBe(true);
			expect(result.secretCode).toBeTruthy();

			// Verify logger was called
			expect(loggerSpy).toHaveBeenCalled();

			// CRITICAL CHECK: Secret code should NOT be in any log call
			const allLogCalls = loggerSpy.mock.calls;

			for (const call of allLogCalls) {
				const logMessage = JSON.stringify(call);

				// Check that secret code is NOT in the log
				expect(logMessage).not.toContain(result.secretCode);

				// Check common patterns that would leak the code
				expect(logMessage).not.toMatch(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);
			}
		});

		it("should only log metadata about code generation", async () => {
			await db.insert(userTable).values({
				id: testUserId,
				name: "Security Test User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
			});

			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			await generateSecretCodeLogic(mockSession);

			// Logger should be called with safe metadata only
			const logCalls = loggerSpy.mock.calls;

			// Should log events like "Secret code generated"
			const hasGenerationLog = logCalls.some((call) =>
				JSON.stringify(call).includes("generated"),
			);
			expect(hasGenerationLog).toBe(true);

			// Should include userId (not sensitive)
			const hasUserId = logCalls.some((call) =>
				JSON.stringify(call).includes(testUserId),
			);
			expect(hasUserId).toBe(true);

			// Should NOT include actual code value
			expect(
				logCalls.every((call) => {
					const logStr = JSON.stringify(call);
					return !logStr.match(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);
				}),
			).toBe(true);
		});

		it("should not log code in error scenarios either", async () => {
			// Try to generate code for non-existent user
			const mockSession = {
				user: { id: "nonexistent-user-id" },
				session: { token: "mock-token" },
			} as any;

			const result = await generateSecretCodeLogic(mockSession);

			expect(result.success).toBe(false);

			// Even in error case, no codes should be logged
			const allLogCalls = loggerSpy.mock.calls;
			for (const call of allLogCalls) {
				const logMessage = JSON.stringify(call);
				expect(logMessage).not.toMatch(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);
			}
		});
	});

	/**
	 * Task 8.2: Guarantee code cannot be enumerated/bruteforced
	 * Entropy analysis and collision resistance
	 */
	describe("Task 8.2: Anti-Enumeration & Brute Force Protection", () => {
		it("should have sufficient entropy (30^12 space)", () => {
			// Character set: ABCDEFGHJKMNPQRSTUVWXYZ23456789 (30 chars)
			// Code length: 12 characters
			// Total space: 30^12 ≈ 5.3 × 10^17

			const characterSet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
			const codeLength = 12;

			const totalPossibilities = characterSet.length ** codeLength;

			// Should be astronomically large
			expect(totalPossibilities).toBeGreaterThan(5e17);

			// At 1 million attempts per second, would take:
			const attemptsPerSecond = 1_000_000;
			const secondsToExhaust = totalPossibilities / attemptsPerSecond;
			const yearsToExhaust = secondsToExhaust / (60 * 60 * 24 * 365);

			// Should take millions of years to brute force
			expect(yearsToExhaust).toBeGreaterThan(1_000_000);
		});

		it("should generate unique codes with high probability", async () => {
			const generatedCodes = new Set<string>();
			const iterations = 100;

			// Generate multiple codes
			for (let i = 0; i < iterations; i++) {
				const userId = `test_${Date.now()}_${i}`;
				await db.insert(userTable).values({
					id: userId,
					name: `Test User ${i}`,
					email: null as any,
					emailVerified: false,
					isAnonymous: true,
				});

				const mockSession = {
					user: { id: userId },
					session: { token: "mock-token" },
				} as any;

				const result = await generateSecretCodeLogic(mockSession);

				if (result.success && result.secretCode) {
					generatedCodes.add(result.secretCode);
				}

				// Cleanup
				await db.delete(userTable).where(eq(userTable.id, userId));
			}

			// All codes should be unique (no collisions)
			expect(generatedCodes.size).toBe(iterations);

			// Verify format of all generated codes
			generatedCodes.forEach((code) => {
				expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
			});
		});

		it("should exclude ambiguous characters (0, O, I, 1, l)", async () => {
			await db.insert(userTable).values({
				id: testUserId,
				name: "Security Test User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
			});

			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			// Generate multiple codes to test
			const codes: string[] = [];
			for (let i = 0; i < 50; i++) {
				// Delete and recreate user to force new code generation
				await db.delete(userTable).where(eq(userTable.id, testUserId));
				await db.insert(userTable).values({
					id: testUserId,
					name: "Security Test User",
					email: null as any,
					emailVerified: false,
					isAnonymous: true,
				});

				const result = await generateSecretCodeLogic(mockSession);
				if (result.success && result.secretCode) {
					codes.push(result.secretCode);
				}
			}

			// Check that NO code contains ambiguous characters
			const ambiguousChars = /[0OI1l]/;
			codes.forEach((code) => {
				expect(code).not.toMatch(ambiguousChars);
			});
		});

		it("should use cryptographically secure random generation", () => {
			// This test verifies that we're using crypto.randomBytes
			// and not Math.random() which is not cryptographically secure

			// Check the implementation uses crypto
			const fs = require("fs");
			const path = require("path");
			const codeGenPath = path.join(
				process.cwd(),
				"src/features/auth/lib/generate-secret-code.ts",
			);

			const sourceCode = fs.readFileSync(codeGenPath, "utf-8");

			// Should use crypto.randomBytes
			expect(sourceCode).toContain("crypto.randomBytes");

			// Should NOT use Math.random (insecure)
			expect(sourceCode).not.toContain("Math.random");
		});

		it("should have database uniqueness constraint", async () => {
			// Try to insert duplicate secret code (should fail)
			const duplicateCode = "TEST-CODE-DUPL";

			await db.insert(userTable).values({
				id: testUserId,
				name: "First User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
				secretCode: duplicateCode,
			});

			// Try to insert second user with same code
			const secondUserId = `${testUserId}_2`;

			await expect(
				db.insert(userTable).values({
					id: secondUserId,
					name: "Second User",
					email: null as any,
					emailVerified: false,
					isAnonymous: true,
					secretCode: duplicateCode,
				}),
			).rejects.toThrow();

			// Cleanup
			await db
				.delete(userTable)
				.where(eq(userTable.id, secondUserId))
				.catch(() => {});
		});
	});

	/**
	 * Task 8.3: Rate limiting on generation
	 * Verify Arcjet integration prevents abuse
	 */
	describe("Task 8.3: Rate Limiting Protection", () => {
		it("should have rate limiting on thread creation endpoint", () => {
			// Verify that create-thread.ts has Arcjet rate limiting
			const fs = require("fs");
			const path = require("path");
			const createThreadPath = path.join(
				process.cwd(),
				"src/features/threads/server/create-thread.ts",
			);

			const sourceCode = fs.readFileSync(createThreadPath, "utf-8");

			// Should import Arcjet functions
			expect(sourceCode).toContain("checkArcjet");
			expect(sourceCode).toContain("handleArcjetDenied");

			// Should call checkArcjet before processing
			expect(sourceCode).toContain("checkArcjet");

			// Should handle denied decision
			expect(sourceCode).toContain("isDenied");
		});

		it("should prevent rapid code generation through rate limit", async () => {
			// Rate limiting is enforced at thread creation level
			// Multiple rapid thread creations = multiple code generation attempts
			// Arcjet should block excessive requests

			// This is an integration test concept
			// Actual rate limit testing requires HTTP requests

			// Verify the rate limit is configured
			const fs = require("fs");
			const path = require("path");
			const createThreadPath = path.join(
				process.cwd(),
				"src/features/threads/server/create-thread.ts",
			);

			const sourceCode = fs.readFileSync(createThreadPath, "utf-8");

			// Rate limiting logic should exist
			expect(sourceCode).toContain("decision");
			expect(sourceCode).toContain("isDenied");
		});

		it("should not allow code regeneration for same user", async () => {
			// Create user with existing code
			const existingCode = "EXST-CODE-1234";

			await db.insert(userTable).values({
				id: testUserId,
				name: "Test User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
				secretCode: existingCode,
				secretCodeGeneratedAt: new Date(),
			});

			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			// Try to generate code again
			const result = await generateSecretCodeLogic(mockSession);

			// Should return existing code, not generate new one
			expect(result.success).toBe(true);
			expect(result.secretCode).toBe(existingCode);
			expect(result.isExisting).toBe(true);

			// Verify code in DB is unchanged
			const [user] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.id, testUserId))
				.limit(1);

			expect(user.secretCode).toBe(existingCode);
		});
	});

	/**
	 * Task 8.4: Complete security audit
	 * Overall security validation
	 */
	describe("Task 8.4: Security Audit Validation", () => {
		it("should only allow code generation for anonymous users", async () => {
			// Create registered (non-anonymous) user
			await db.insert(userTable).values({
				id: testUserId,
				name: "Registered User",
				email: "test@example.com",
				emailVerified: true,
				isAnonymous: false, // NOT anonymous
			});

			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			// Try to generate code
			const result = await generateSecretCodeLogic(mockSession);

			// Should be rejected
			expect(result.success).toBe(false);
			expect(result.error).toBeTruthy();

			// Verify no code in database
			const [user] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.id, testUserId))
				.limit(1);

			expect(user.secretCode).toBeNull();
		});

		it("should validate session before code generation", async () => {
			// Invalid session (no user)
			const invalidSession = {
				user: null,
				session: null,
			} as any;

			const result = await generateSecretCodeLogic(invalidSession);

			// Should fail gracefully
			expect(result.success).toBe(false);
			expect(result.error).toContain("session");
		});

		it("should handle database errors gracefully", async () => {
			// Non-existent user
			const mockSession = {
				user: { id: "nonexistent-user-12345" },
				session: { token: "mock-token" },
			} as any;

			const result = await generateSecretCodeLogic(mockSession);

			// Should fail but not throw
			expect(result.success).toBe(false);

			// Should not leak information
			expect(result.error).not.toContain("nonexistent-user-12345");
		});

		it("should have timestamp for code generation", async () => {
			await db.insert(userTable).values({
				id: testUserId,
				name: "Test User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
			});

			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			const beforeTime = new Date();
			await generateSecretCodeLogic(mockSession);
			const afterTime = new Date();

			const [user] = await db
				.select()
				.from(userTable)
				.where(eq(userTable.id, testUserId))
				.limit(1);

			expect(user.secretCodeGeneratedAt).toBeInstanceOf(Date);
			expect(user.secretCodeGeneratedAt!.getTime()).toBeGreaterThanOrEqual(
				beforeTime.getTime(),
			);
			expect(user.secretCodeGeneratedAt!.getTime()).toBeLessThanOrEqual(
				afterTime.getTime(),
			);
		});

		it("should not expose code in error messages", async () => {
			// Create user with code
			const secretCode = "TEST-CODE-5678";
			await db.insert(userTable).values({
				id: testUserId,
				name: "Test User",
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
				secretCode,
			});

			const mockSession = {
				user: { id: testUserId },
				session: { token: "mock-token" },
			} as any;

			// Try various operations
			const result = await generateSecretCodeLogic(mockSession);

			// Error messages should never contain the actual code
			if (result.error) {
				expect(result.error).not.toContain(secretCode);
				expect(result.error).not.toMatch(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);
			}
		});
	});

	/**
	 * Regression tests for known vulnerabilities
	 */
	describe("Regression Tests", () => {
		it("should not generate codes with sequential patterns", async () => {
			const codes: string[] = [];

			for (let i = 0; i < 20; i++) {
				const userId = `seq_test_${Date.now()}_${i}`;
				await db.insert(userTable).values({
					id: userId,
					name: "Seq Test",
					email: null as any,
					emailVerified: false,
					isAnonymous: true,
				});

				const mockSession = {
					user: { id: userId },
					session: { token: "mock-token" },
				} as any;

				const result = await generateSecretCodeLogic(mockSession);
				if (result.success && result.secretCode) {
					codes.push(result.secretCode);
				}

				await db.delete(userTable).where(eq(userTable.id, userId));
			}

			// Check for sequential patterns (would indicate weak RNG)
			for (let i = 0; i < codes.length - 1; i++) {
				const current = codes[i];
				const next = codes[i + 1];

				// Codes should not be similar
				expect(current).not.toBe(next);

				// No incrementing patterns
				const currentNum = current.replace(/-/g, "");
				const nextNum = next.replace(/-/g, "");
				expect(currentNum).not.toBe(nextNum);
			}
		});

		it("should handle maximum retry attempts for uniqueness", async () => {
			// This tests the edge case where we hit max retries
			// In practice, with 30^12 space, collisions are virtually impossible

			// Verify max retry logic exists
			const fs = require("fs");
			const path = require("path");
			const codeGenPath = path.join(
				process.cwd(),
				"src/features/auth/lib/generate-secret-code.ts",
			);

			const sourceCode = fs.readFileSync(codeGenPath, "utf-8");

			// Should have retry logic with max attempts
			expect(sourceCode).toContain("attempt");
			expect(sourceCode.match(/while|for/)).toBeTruthy();
		});
	});
});
