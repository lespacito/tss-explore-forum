import { describe, expect, it } from "vitest";
import {
	getAuthorDisplayName,
	getCategoryColor,
	isThreadCategorySensitive,
} from "../thread-utils";

describe("isThreadCategorySensitive", () => {
	it("returns true for sensitive categories", () => {
		expect(isThreadCategorySensitive("VIOLENCE")).toBe(true);
		expect(isThreadCategorySensitive("ABUS")).toBe(true);
		expect(isThreadCategorySensitive("DETRESSE")).toBe(true);
	});

	it("returns false for non-sensitive categories", () => {
		expect(isThreadCategorySensitive("TEMOIN")).toBe(false);
		expect(isThreadCategorySensitive("AUTRE")).toBe(false);
	});

	it("is case-insensitive", () => {
		expect(isThreadCategorySensitive("violence")).toBe(true);
		expect(isThreadCategorySensitive("Violence")).toBe(true);
		expect(isThreadCategorySensitive("abus")).toBe(true);
	});

	it("returns false for empty string", () => {
		expect(isThreadCategorySensitive("")).toBe(false);
	});
});

describe("getAuthorDisplayName", () => {
	it("returns alias for sensitive posts", () => {
		expect(
			getAuthorDisplayName({
				isSensitive: true,
				threadCategory: "AUTRE",
				aliasName: "brave-fox",
				displayUsername: "John",
			}),
		).toBe("brave-fox");
	});

	it("returns alias for sensitive category threads", () => {
		expect(
			getAuthorDisplayName({
				isSensitive: false,
				threadCategory: "VIOLENCE",
				aliasName: "brave-fox",
				displayUsername: "John",
			}),
		).toBe("brave-fox");
	});

	it("falls back to 'Anonyme' when alias is null in sensitive context", () => {
		expect(
			getAuthorDisplayName({
				isSensitive: true,
				threadCategory: "AUTRE",
				aliasName: null,
				displayUsername: "John",
			}),
		).toBe("Anonyme");
	});

	it("returns displayUsername for non-sensitive context", () => {
		expect(
			getAuthorDisplayName({
				isSensitive: false,
				threadCategory: "TEMOIN",
				aliasName: "brave-fox",
				displayUsername: "John",
			}),
		).toBe("John");
	});

	it("falls back to alias when displayUsername is null in non-sensitive context", () => {
		expect(
			getAuthorDisplayName({
				isSensitive: false,
				threadCategory: "TEMOIN",
				aliasName: "brave-fox",
				displayUsername: null,
			}),
		).toBe("brave-fox");
	});

	it("falls back to 'Utilisateur' when both are null in non-sensitive context", () => {
		expect(
			getAuthorDisplayName({
				isSensitive: false,
				threadCategory: "TEMOIN",
				aliasName: null,
				displayUsername: null,
			}),
		).toBe("Utilisateur");
	});
});

describe("getCategoryColor", () => {
	it("returns correct classes for all 5 categories", () => {
		expect(getCategoryColor("VIOLENCE")).toContain("destructive");
		expect(getCategoryColor("ABUS")).toContain("primary");
		expect(getCategoryColor("TEMOIN")).toContain("accent");
		expect(getCategoryColor("DETRESSE")).toContain("secondary");
		expect(getCategoryColor("AUTRE")).toContain("muted");
	});

	it("is case-insensitive", () => {
		expect(getCategoryColor("violence")).toBe(getCategoryColor("VIOLENCE"));
		expect(getCategoryColor("Abus")).toBe(getCategoryColor("ABUS"));
	});

	it("returns muted fallback for unknown category", () => {
		const result = getCategoryColor("UNKNOWN");
		expect(result).toContain("muted");
		expect(result).toBe("bg-muted/10 text-muted-foreground border-muted/20");
	});
});
