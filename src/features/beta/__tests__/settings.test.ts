import { afterEach, expect, it, vi } from "vitest";
import { betaSettings } from "../server/settings";

afterEach(() => vi.unstubAllEnvs());
it("keeps submissions closed unless an explicit opening and schedule are present", () => {
	vi.stubEnv("BETA_SUBMISSIONS_OPEN", "");
	vi.stubEnv("BETA_MODERATION_SCHEDULE", "");
	expect(betaSettings().submissionsOpen).toBe(false);
	vi.stubEnv("BETA_SUBMISSIONS_OPEN", "true");
	expect(betaSettings().submissionsOpen).toBe(false);
	vi.stubEnv("BETA_MODERATION_SCHEDULE", "Lundi 18–19 h");
	expect(betaSettings().submissionsOpen).toBe(true);
	vi.stubEnv("BETA_SUBMISSIONS_OPEN", "false");
	expect(betaSettings().submissionsOpen).toBe(false);
});
