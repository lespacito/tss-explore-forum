import { describe, expect, it } from "vitest";
import { feedbackSchema } from "@/features/feedback/schemas/feedback";

describe("Feedback schema", () => {
	it("accepts valid required ratings 1-5", () => {
		const valid = {
			overallRating: 3,
			easeOfUse: 5,
			trustAnonymity: 1,
		};
		expect(feedbackSchema.parse(valid)).toEqual(valid);
	});

	it("rejects ratings outside 1-5 range", () => {
		expect(() => feedbackSchema.parse({ overallRating: 0, easeOfUse: 3, trustAnonymity: 3 })).toThrow();
		expect(() => feedbackSchema.parse({ overallRating: 6, easeOfUse: 3, trustAnonymity: 3 })).toThrow();
		expect(() => feedbackSchema.parse({ overallRating: 3, easeOfUse: -1, trustAnonymity: 3 })).toThrow();
	});

	it("accepts optional text fields within length limits", () => {
		const valid = {
			overallRating: 4,
			easeOfUse: 4,
			trustAnonymity: 4,
			misunderstood: "A",
			bugDescription: "B".repeat(1000),
			bugPage: "C".repeat(200),
			improvementSuggestion: "D".repeat(1000),
			freeComment: "E".repeat(2000),
		};
		expect(feedbackSchema.parse(valid)).toEqual(valid);
	});

	it("rejects text fields exceeding length limits", () => {
		expect(() => feedbackSchema.parse({
			overallRating: 3, easeOfUse: 3, trustAnonymity: 3,
			misunderstood: "A".repeat(501),
		})).toThrow();
		expect(() => feedbackSchema.parse({
			overallRating: 3, easeOfUse: 3, trustAnonymity: 3,
			bugDescription: "A".repeat(1001),
		})).toThrow();
		expect(() => feedbackSchema.parse({
			overallRating: 3, easeOfUse: 3, trustAnonymity: 3,
			freeComment: "A".repeat(2001),
		})).toThrow();
	});

	it("allows bugDescription without bugPage (both optional independently)", () => {
		const data = {
			overallRating: 2,
			easeOfUse: 2,
			trustAnonymity: 2,
			bugDescription: "Une page plante au chargement",
		};
		expect(feedbackSchema.parse(data)).toEqual(data);
	});

	it("requires all three rating fields", () => {
		expect(() => feedbackSchema.parse({ overallRating: 3, easeOfUse: 3 })).toThrow();
		expect(() => feedbackSchema.parse({ overallRating: 3 })).toThrow();
		expect(() => feedbackSchema.parse({})).toThrow();
	});

	it("validates that rating fields are integers", () => {
		expect(() => feedbackSchema.parse({
			overallRating: 3.5,
			easeOfUse: 3,
			trustAnonymity: 3,
		})).toThrow();
		expect(() => feedbackSchema.parse({
			overallRating: "3",
			easeOfUse: 3,
			trustAnonymity: 3,
		})).toThrow();
	});
});