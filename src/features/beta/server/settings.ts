import { createServerFn } from "@tanstack/react-start";
import { publicationMode } from "../lib/publication-mode";
export function betaSettings() {
	const moderationSchedule =
		process.env.BETA_MODERATION_SCHEDULE?.trim() ||
		"Créneaux à confirmer par l’organisateur.";
	const submissionsOpen =
		process.env.BETA_SUBMISSIONS_OPEN === "true" &&
		Boolean(process.env.BETA_MODERATION_SCHEDULE?.trim());
	const mode = publicationMode(process.env.PUBLICATION_MODE);
	return {
		moderationSchedule,
		publicationMode: mode,
		// Opt-in presentation only; this never changes access or submission controls.
		preprodShowcase:
			process.env.PREPROD_SHOWCASE === "true" &&
			mode === "test" &&
			!submissionsOpen,
		submissionsOpen,
		// Mirror the existing gate without importing its Node-only cookie machinery.
		accessRequired: process.env.BETA_ACCESS_REQUIRED !== "false",
	};
}
export const getBetaSettings = createServerFn({ method: "GET" }).handler(() =>
	betaSettings(),
);
