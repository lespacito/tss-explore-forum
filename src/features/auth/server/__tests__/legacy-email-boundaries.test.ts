import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("removes the callable username-to-private-email endpoint", () => {
	expect(
		existsSync("src/features/auth/server/get-user-email-by-username.ts"),
	).toBe(false);
});
it("does not publish a callable welcome-email server function", () => {
	const source = readFileSync(
		"src/features/auth/server/send-welcome-email.ts",
		"utf8",
	);
	expect(source).not.toContain("createServerFn");
	expect(source).toContain("createServerOnlyFn");
});
