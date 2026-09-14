import { describe, expect, it } from "vitest";
import { eraseBetaAccountSchema } from "../../schemas/erase-account";

describe("eraseBetaAccountSchema", () => {
	it.each(["EFFACER", "effacer", " Effacer "])(
		"normalizes an intentional confirmation: %s",
		(confirmation) => {
			expect(eraseBetaAccountSchema.parse({ confirmation })).toEqual({
				confirmation: "EFFACER",
			});
		},
	);

	it("rejects a different confirmation", () => {
		expect(() =>
			eraseBetaAccountSchema.parse({ confirmation: "SUPPRIMER" }),
		).toThrow();
	});
});
