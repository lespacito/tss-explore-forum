import { describe, expect, it } from "vitest";
import { signupSchema } from "../signup-schema";

describe("signupSchema", () => {
	it("should accept valid data", () => {
		const result = signupSchema.safeParse({
			username: "thomas123",
			email: "thomas@example.com",
			password: "SecurePass1",
			confirmPassword: "SecurePass1",
		});

		expect(result.success).toBe(true);
	});

	it("should reject short username", () => {
		const result = signupSchema.safeParse({
			username: "ab", // moins de 3 caractères
			email: "test@example.com",
			password: "SecurePass1",
			confirmPassword: "SecurePass1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toContain("username");
		}
	});

	it("should reject invalid email", () => {
		const result = signupSchema.safeParse({
			username: "thomas123",
			email: "not-an-email",
			password: "SecurePass1",
			confirmPassword: "SecurePass1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toContain("email");
		}
	});

	it("should reject weak password", () => {
		const result = signupSchema.safeParse({
			username: "thomas123",
			email: "test@example.com",
			password: "weak", // pas de majuscule ni chiffre
			confirmPassword: "weak",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toContain("password");
		}
	});

	it("should reject mismatched passwords", () => {
		const result = signupSchema.safeParse({
			username: "thomas123",
			email: "test@example.com",
			password: "SecurePass1",
			confirmPassword: "DifferentPass1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const error = result.error.issues.find((issue) =>
				issue.path.includes("confirmPassword"),
			);
			expect(error).toBeDefined();
		}
	});

	it("should normalize email to lowercase", () => {
		const result = signupSchema.safeParse({
			username: "thomas123",
			email: "Thomas@EXAMPLE.COM",
			password: "SecurePass1",
			confirmPassword: "SecurePass1",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.email).toBe("thomas@example.com");
		}
	});

	it("should reject forbidden usernames", () => {
		const result = signupSchema.safeParse({
			username: "admin",
			email: "test@example.com",
			password: "SecurePass1",
			confirmPassword: "SecurePass1",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toContain("username");
		}
	});
});
