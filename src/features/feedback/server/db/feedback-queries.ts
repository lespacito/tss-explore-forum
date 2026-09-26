import { desc } from "drizzle-orm";
import { db } from "@/db";
import { feedback } from "@/db/schemas/feedback";

export type FeedbackItem = {
	id: string;
	overallRating: number;
	easeOfUse: number;
	trustAnonymity: number;
	misunderstood: string | null;
	bugDescription: string | null;
	bugPage: string | null;
	improvementSuggestion: string | null;
	freeComment: string | null;
	createdAt: string;
};

export async function getFeedbackList(): Promise<FeedbackItem[]> {
	const rows = await db
		.select({
			id: feedback.id,
			overallRating: feedback.overallRating,
			easeOfUse: feedback.easeOfUse,
			trustAnonymity: feedback.trustAnonymity,
			misunderstood: feedback.misunderstood,
			bugDescription: feedback.bugDescription,
			bugPage: feedback.bugPage,
			improvementSuggestion: feedback.improvementSuggestion,
			freeComment: feedback.freeComment,
			createdAt: feedback.createdAt,
		})
		.from(feedback)
		.orderBy(desc(feedback.createdAt));

	return rows as FeedbackItem[];
}