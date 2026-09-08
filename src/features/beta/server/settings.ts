import { createServerFn } from "@tanstack/react-start";
export function betaSettings() {
	const moderationSchedule =
		process.env.BETA_MODERATION_SCHEDULE?.trim() ||
		"Créneaux à confirmer par l’organisateur.";
	const submissionsOpen =
		process.env.BETA_SUBMISSIONS_OPEN === "true" &&
		Boolean(process.env.BETA_MODERATION_SCHEDULE?.trim());
	return { moderationSchedule, submissionsOpen };
}
export const getBetaSettings = createServerFn({ method: "GET" }).handler(() =>
	betaSettings(),
);
