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

it.each([undefined, "", "invalid", "REAL", "test", "real"])(
	"defaults publication presentation to test unless explicitly real (%s)",
	(mode) => {
		vi.stubEnv("PUBLICATION_MODE", mode);
		expect(betaSettings().publicationMode).toBe(
			mode === "real" ? "real" : "test",
		);
	},
);
it.each(["test", "real"])(
	"keeps access and submission flags independent of %s presentation",
	(mode) => {
		vi.stubEnv("PUBLICATION_MODE", mode);
		for (const gate of ["true", "false"]) {
			vi.stubEnv("BETA_ACCESS_REQUIRED", gate);
			for (const open of ["true", "false"]) {
				vi.stubEnv("BETA_SUBMISSIONS_OPEN", open);
				vi.stubEnv("BETA_MODERATION_SCHEDULE", "Lundi 18–19 h");
				expect(betaSettings()).toMatchObject({
					publicationMode: mode,
					accessRequired: gate !== "false",
					submissionsOpen: open === "true",
				});
				vi.stubEnv("BETA_MODERATION_SCHEDULE", "");
				expect(betaSettings().submissionsOpen).toBe(false);
			}
		}
	},
);

it.each([
	[undefined, "test", "false", false],
	["false", "test", "false", false],
	["invalid", "test", "false", false],
	["true", "test", "false", true],
	["true", "test", "true", false],
	["true", "real", "false", false],
] as const)(
	"showcase opt-in=%s mode=%s submissions=%s produces %s without changing authorization",
	(flag, mode, open, expected) => {
		vi.stubEnv("PREPROD_SHOWCASE", flag);
		vi.stubEnv("PUBLICATION_MODE", mode);
		vi.stubEnv("BETA_SUBMISSIONS_OPEN", open);
		vi.stubEnv("BETA_MODERATION_SCHEDULE", "Lundi 18–19 h");
		for (const gate of ["true", "false"]) {
			vi.stubEnv("BETA_ACCESS_REQUIRED", gate);
			expect(betaSettings()).toMatchObject({
				preprodShowcase: expected,
				publicationMode: mode,
				submissionsOpen: open === "true",
				accessRequired: gate !== "false",
			});
		}
	},
);
