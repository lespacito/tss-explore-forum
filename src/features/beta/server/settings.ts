import { createServerFn } from "@tanstack/react-start";
export function betaSettings() {
	const moderationSchedule =
		process.env.BETA_MODERATION_SCHEDULE?.trim() ||
		"Créneaux à confirmer par l’organisateur.";
	const submissionsOpen =
		process.env.BETA_SUBMISSIONS_OPEN === "true" &&
		Boolean(process.env.BETA_MODERATION_SCHEDULE?.trim());
	return {
		moderationSchedule,
		submissionsOpen,
		// Mirror the existing gate without importing its Node-only cookie machinery.
		accessRequired: process.env.BETA_ACCESS_REQUIRED !== "false",
	};
}
export const getBetaSettings = createServerFn({ method: "GET" }).handler(() =>
	betaSettings(),
);
