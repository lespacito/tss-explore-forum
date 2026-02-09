import { describe, expect, it } from "vitest";
import { getInitials } from "../string-utils";

describe("getInitials", () => {
	it("returns initials from hyphenated alias names", () => {
		expect(getInitials("brave-fox")).toBe("BF");
		expect(getInitials("silent-night-owl")).toBe("SN");
	});

	it("returns initials from space-separated display names", () => {
		expect(getInitials("John Doe")).toBe("JD");
		expect(getInitials("Alice Marie Smith")).toBe("AM");
	});

	it("returns first 2 chars for single words", () => {
		expect(getInitials("Alice")).toBe("AL");
		expect(getInitials("X")).toBe("X");
	});

	it("returns fallback for null, undefined, and empty string", () => {
		expect(getInitials(null)).toBe("??");
		expect(getInitials(undefined)).toBe("??");
		expect(getInitials("")).toBe("??");
		expect(getInitials("   ")).toBe("??");
	});

	it("supports custom fallback", () => {
		expect(getInitials(null, "NA")).toBe("NA");
		expect(getInitials("", "??!")).toBe("??!");
	});

	it("always returns uppercase", () => {
		expect(getInitials("brave-fox")).toBe("BF");
		expect(getInitials("john doe")).toBe("JD");
		expect(getInitials("alice")).toBe("AL");
	});

	it("returns max 2 characters", () => {
		expect(getInitials("a-b-c-d-e")).toBe("AB");
		expect(getInitials("A B C D E")).toBe("AB");
	});
});
