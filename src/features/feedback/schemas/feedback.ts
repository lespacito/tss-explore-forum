import { z } from "zod";

export const feedbackSchema = z.object({
	overallRating: z.number().int().min(1).max(5),
	easeOfUse: z.number().int().min(1).max(5),
	trustAnonymity: z.number().int().min(1).max(5),
	misunderstood: z.string().max(500).optional(),
	bugDescription: z.string().max(1000).optional(),
	bugPage: z.string().max(200).optional(),
	improvementSuggestion: z.string().max(1000).optional(),
	freeComment: z.string().max(2000).optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;