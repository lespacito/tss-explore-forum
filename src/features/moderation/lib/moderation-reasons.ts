export const moderationReasonCodes = [
	"IDENTIFYING_DETAIL",
	"REAL_OR_URGENT",
	"OUT_OF_SCOPE",
	"INSUFFICIENT_INFORMATION",
] as const;

const realModerationReasonCodes = [
	"IDENTIFYING_DETAIL",
	"URGENT",
	"OUT_OF_SCOPE",
	"INSUFFICIENT_INFORMATION",
] as const;

export type ModerationReasonCode =
	| (typeof moderationReasonCodes)[number]
	| (typeof realModerationReasonCodes)[number];

export const moderationReasonLabels = {
	IDENTIFYING_DETAIL:
		"Cette situation fictive contient un détail qui pourrait permettre d’identifier une personne.",
	REAL_OR_URGENT:
		"Cette situation fictive semble décrire une situation réelle ou urgente, hors du cadre fictif de cette bêta.",
	OUT_OF_SCOPE:
		"Cette situation fictive ne correspond pas au périmètre de cette bêta.",
	INSUFFICIENT_INFORMATION:
		"Les informations fournies ne permettent pas d’examiner cette situation fictive.",
};

const realModerationReasonLabels = {
	IDENTIFYING_DETAIL:
		"Ce témoignage contient un détail qui pourrait permettre d’identifier une personne.",
	URGENT:
		"Ce témoignage décrit une situation urgente qui ne peut pas être traitée dans cet espace. Consultez les ressources d’aide de la page Aide (/help).",
	OUT_OF_SCOPE: "Ce témoignage ne correspond pas au périmètre de cet espace.",
	INSUFFICIENT_INFORMATION:
		"Les informations fournies ne permettent pas d’examiner ce témoignage.",
};

export function getModerationReasons(mode: "test" | "real") {
	return mode === "real"
		? realModerationReasonCodes.map((code) => ({
				code,
				label: realModerationReasonLabels[code],
			}))
		: moderationReasonCodes.map((code) => ({
				code,
				label: moderationReasonLabels[code],
			}));
}

export function formatModerationReason(
	reasonCode: ModerationReasonCode,
	details?: string,
	mode: "test" | "real" = "test",
) {
	const reason = getModerationReasons(mode).find(
		({ code }) => code === reasonCode,
	);
	if (!reason)
		throw new Error("Motif indisponible dans ce mode de publication.");
	const clarification = details?.trim();
	return clarification ? `${reason.label} ${clarification}` : reason.label;
}
