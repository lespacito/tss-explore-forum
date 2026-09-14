import { describe, expect, it } from "vitest";
import {
	hasSupportedOAuthAccount,
	isRecentAuthentication,
	OAUTH_ERASURE_REAUTH_WINDOW_MS,
} from "../erase-account-auth";

describe("OAuth account erasure authentication", () => {
	const now = Date.parse("2026-09-14T12:00:00.000Z");

	it("accepts a recent authentication", () => {
		expect(isRecentAuthentication(new Date(now - 60_000), now)).toBe(true);
		expect(
			isRecentAuthentication(
				new Date(now - OAUTH_ERASURE_REAUTH_WINDOW_MS),
				now,
			),
		).toBe(true);
	});

	it("rejects stale, future and invalid authentication dates", () => {
		expect(
			isRecentAuthentication(
				new Date(now - OAUTH_ERASURE_REAUTH_WINDOW_MS - 1),
				now,
			),
		).toBe(false);
		expect(isRecentAuthentication(new Date(now + 1), now)).toBe(false);
		expect(isRecentAuthentication("not-a-date", now)).toBe(false);
	});

	it("recognizes only the OAuth providers configured by the application", () => {
		expect(hasSupportedOAuthAccount(["google"])).toBe(true);
		expect(hasSupportedOAuthAccount(["github"])).toBe(true);
		expect(hasSupportedOAuthAccount(["credential"])).toBe(false);
		expect(hasSupportedOAuthAccount(["unknown-provider"])).toBe(false);
	});
});
