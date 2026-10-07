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

it.each(["true", "false"])(
	"controls contributions independently when BETA_ACCESS_REQUIRED=%s",
	(gate) => {
		vi.stubEnv("BETA_ACCESS_REQUIRED", gate);
		vi.stubEnv("BETA_MODERATION_SCHEDULE", "Lundi 18–19 h");
		vi.stubEnv("BETA_SUBMISSIONS_OPEN", "false");
		expect(betaSettings().submissionsOpen).toBe(false);
		vi.stubEnv("BETA_SUBMISSIONS_OPEN", "true");
		expect(betaSettings().submissionsOpen).toBe(true);
		vi.stubEnv("BETA_MODERATION_SCHEDULE", " ");
		expect(betaSettings().submissionsOpen).toBe(false);
	},
);

it.each([undefined, "true", "false", "invalid"])(
	"exposes the actual gate flag to presentation (%s)",
	(flag) => {
		vi.stubEnv("BETA_ACCESS_REQUIRED", flag);
		vi.stubEnv("BETA_INVITATION_CODES", "never-send-this-to-client");
		const settings = betaSettings();
		expect(settings.accessRequired).toBe(flag !== "false");
		expect(settings).not.toHaveProperty("invitationCodes");
		expect(JSON.stringify(settings)).not.toContain("never-send-this-to-client");
	},
);
