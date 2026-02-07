import { describe, expect, it } from "vitest";
import { signInSchema } from "../sign-in-schema";

describe("signInSchema", () => {
	describe("Valid inputs", () => {
		it("should accept valid username and password", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: "Password123!",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.username).toBe("testuser");
				expect(result.data.password).toBe("Password123!");
			}
		});

		it("should accept minimum length username (1 character)", () => {
			const result = signInSchema.safeParse({
				username: "a",
				password: "password123",
			});

			expect(result.success).toBe(true);
		});

		it("should accept maximum length username (100 characters)", () => {
			const longUsername = "a".repeat(100);
			const result = signInSchema.safeParse({
				username: longUsername,
				password: "password123",
			});

			expect(result.success).toBe(true);
		});

		it("should accept username with special characters", () => {
			const result = signInSchema.safeParse({
				username: "user_name-123",
				password: "Password123!",
			});

			expect(result.success).toBe(true);
		});

		it("should accept minimum length password (1 character)", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: "p",
			});

			expect(result.success).toBe(true);
		});

		it("should accept maximum length password (100 characters)", () => {
			const longPassword = "P".repeat(100);
			const result = signInSchema.safeParse({
				username: "testuser",
				password: longPassword,
			});

			expect(result.success).toBe(true);
		});
	});

	describe("Invalid inputs", () => {
		it("should reject empty username", () => {
			const result = signInSchema.safeParse({
				username: "",
				password: "password123",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					"Le nom d'utilisateur est requis",
				);
				expect(result.error.issues[0].path).toEqual(["username"]);
			}
		});

		it("should reject missing username", () => {
			const result = signInSchema.safeParse({
				password: "password123",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(["username"]);
			}
		});

		it("should reject username longer than 100 characters", () => {
			const tooLongUsername = "a".repeat(101);
			const result = signInSchema.safeParse({
				username: tooLongUsername,
				password: "password123",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(["username"]);
			}
		});

		it("should reject empty password", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: "",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					"Le mot de passe est requis",
				);
				expect(result.error.issues[0].path).toEqual(["password"]);
			}
		});

		it("should reject missing password", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(["password"]);
			}
		});

		it("should reject password longer than 100 characters", () => {
			const tooLongPassword = "P".repeat(101);
			const result = signInSchema.safeParse({
				username: "testuser",
				password: tooLongPassword,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toEqual(["password"]);
			}
		});

		it("should reject both missing username and password", () => {
			const result = signInSchema.safeParse({});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
				const paths = result.error.issues.map((issue) => issue.path[0]);
				expect(paths).toContain("username");
				expect(paths).toContain("password");
			}
		});
	});

	describe("Type coercion and whitespace", () => {
		it("should NOT trim username whitespace (preserve as-is)", () => {
			const result = signInSchema.safeParse({
				username: "  testuser  ",
				password: "password123",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				// Schema does NOT trim, so whitespace is preserved
				expect(result.data.username).toBe("  testuser  ");
			}
		});

		it("should NOT trim password whitespace (preserve as-is)", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: "  password123  ",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				// Schema does NOT trim, so whitespace is preserved
				expect(result.data.password).toBe("  password123  ");
			}
		});

		it("should reject non-string username", () => {
			const result = signInSchema.safeParse({
				username: 123,
				password: "password123",
			});

			expect(result.success).toBe(false);
		});

		it("should reject non-string password", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: 123,
			});

			expect(result.success).toBe(false);
		});
	});

	describe("Edge cases", () => {
		it("should accept username with only spaces (1 character minimum)", () => {
			const result = signInSchema.safeParse({
				username: " ",
				password: "password123",
			});

			expect(result.success).toBe(true);
		});

		it("should accept password with only spaces (1 character minimum)", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: " ",
			});

			expect(result.success).toBe(true);
		});

		it("should accept username with unicode characters", () => {
			const result = signInSchema.safeParse({
				username: "用户名",
				password: "password123",
			});

			expect(result.success).toBe(true);
		});

		it("should accept password with unicode characters", () => {
			const result = signInSchema.safeParse({
				username: "testuser",
				password: "密码123",
			});

			expect(result.success).toBe(true);
		});

		it("should handle null values gracefully", () => {
			const result = signInSchema.safeParse({
				username: null,
				password: null,
			});

			expect(result.success).toBe(false);
		});

		it("should handle undefined values gracefully", () => {
			const result = signInSchema.safeParse({
				username: undefined,
				password: undefined,
			});

			expect(result.success).toBe(false);
		});
	});
});
