import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db } from "@/db";
import { feedback } from "@/db/schemas/feedback";
import { feedbackSchema } from "@/features/feedback/schemas/feedback";
import { checkRateLimit } from "@/features/feedback/lib/rate-limit";

export const submitFeedback = createServerFn({ method: "POST" })
	.validator((data: unknown) => feedbackSchema.parse(data))
	.handler(async ({ data }) => {
		const request = getRequest();
		const rateLimit = checkRateLimit(request);

		if (!rateLimit.allowed) {
			return { success: false, error: rateLimit.reason || "Trop de soumissions. Réessayez plus tard." };
		}

		try {
			await db.insert(feedback).values({
				overallRating: data.overallRating,
				easeOfUse: data.easeOfUse,
				trustAnonymity: data.trustAnonymity,
				misunderstood: data.misunderstood ?? null,
				bugDescription: data.bugDescription ?? null,
				bugPage: data.bugPage ?? null,
				improvementSuggestion: data.improvementSuggestion ?? null,
				freeComment: data.freeComment ?? null,
			}).returning();
		} catch (error) {
			return {
				success: false,
				error: "Impossible d'enregistrer votre retour. Réessayez plus tard.",
			};
		}

		return { success: true };
	});