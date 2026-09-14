import { describe, expect, it } from "vitest";
import { createThreadSchema } from "../../schemas/create-thread";

/**
 * Test Suite: Category Validation in createThreadSchema
 * Coverage: Task 2 - Zod enum validation for thread categories
 */

describe("Task 2: Category Validation", () => {
	it("trims titles and rejects blank or too-short values", () => {
		expect(() =>
			createThreadSchema.parse({ title: "   ", body: "Test body" }),
		).toThrow();
		expect(() =>
			createThreadSchema.parse({ title: "ab", body: "Test body" }),
		).toThrow();
		expect(
			createThreadSchema.parse({ title: "  Titre valide  ", body: "Test body" })
				.title,
		).toBe("Titre valide");
	});

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
		it("accepts an omitted category as an unclassified scenario", () => {
			const result = createThreadSchema.parse({
				title: "Scénario sans classement",
				body: "Un contenu fictif suffisamment détaillé.",
			});

			expect(result.category).toBeUndefined();
		});

		it("keeps an explicit Other choice distinct from no category", () => {
			const result = createThreadSchema.parse({
				title: "Autre situation",
				body: "Un contenu fictif suffisamment détaillé.",
				category: "AUTRE",
			});

			expect(result.category).toBe("AUTRE");
		});

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
