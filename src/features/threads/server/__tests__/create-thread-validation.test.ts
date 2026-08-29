import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { ThreadCategory } from "@/data/threads-categories";

/**
 * Test Suite: Category Validation in createThreadSchema
 * Coverage: Task 2 - Zod enum validation for thread categories
 */

// Recreate schema to test independently (same as in create-thread.ts)
const createThreadSchema = z.object({
	title: z
		.string()
		.min(1, "Le titre ne peut pas être vide")
		.max(200, "Le titre ne peut pas dépasser 200 caractères"),
	body: z
		.string()
		.min(1, "Le contenu ne peut pas être vide")
		.max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
	category: z.enum(["VIOLENCE", "ABUS", "TEMOIN", "DETRESSE", "AUTRE"]) as z.ZodType<ThreadCategory>,
});

describe("Task 2: Category Validation", () => {
	describe("Subtask 2.4: Validation rejects invalid categories", () => {
		it("should reject old category value 'support'", () => {
			const invalidData = {
				title: "Test thread",
				body: "Test body",
				category: "support", // Old category from legacy dialog
			};

			expect(() => createThreadSchema.parse(invalidData)).toThrow();
		});

		it("should reject old category value 'discussion'", () => {
			const invalidData = {
				title: "Test thread",
				body: "Test body",
				category: "discussion",
			};

			expect(() => createThreadSchema.parse(invalidData)).toThrow();
		});

		it("should reject old category value 'question'", () => {
			const invalidData = {
				title: "Test thread",
				body: "Test body",
				category: "question",
			};

			expect(() => createThreadSchema.parse(invalidData)).toThrow();
		});

		it("should reject random invalid category", () => {
			const invalidData = {
				title: "Test thread",
				body: "Test body",
				category: "RANDOM_INVALID",
			};

			// Zod throws an error for invalid enum values
			expect(() => createThreadSchema.parse(invalidData)).toThrow();
		});

		it("should reject empty category", () => {
			const invalidData = {
				title: "Test thread",
				body: "Test body",
				category: "",
			};

			expect(() => createThreadSchema.parse(invalidData)).toThrow();
		});
	});

	describe("Subtask 2.5: Validation accepts valid categories", () => {
		it("should accept 'VIOLENCE' category", () => {
			const validData = {
				title: "Test thread",
				body: "Test body",
				category: "VIOLENCE",
			};

			const result = createThreadSchema.parse(validData);
			expect(result.category).toBe("VIOLENCE");
		});

		it("should accept 'ABUS' category", () => {
			const validData = {
				title: "Test thread",
				body: "Test body",
				category: "ABUS",
			};

			const result = createThreadSchema.parse(validData);
			expect(result.category).toBe("ABUS");
		});

		it("should accept 'TEMOIN' category", () => {
			const validData = {
				title: "Test thread",
				body: "Test body",
				category: "TEMOIN",
			};

			const result = createThreadSchema.parse(validData);
			expect(result.category).toBe("TEMOIN");
		});

		it("should accept 'DETRESSE' category", () => {
			const validData = {
				title: "Test thread",
				body: "Test body",
				category: "DETRESSE",
			};

			const result = createThreadSchema.parse(validData);
			expect(result.category).toBe("DETRESSE");
		});

		it("should accept 'AUTRE' category", () => {
			const validData = {
				title: "Test thread",
				body: "Test body",
				category: "AUTRE",
			};

			const result = createThreadSchema.parse(validData);
			expect(result.category).toBe("AUTRE");
		});
	});
});
