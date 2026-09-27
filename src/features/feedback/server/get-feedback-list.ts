import { createServerFn } from "@tanstack/react-start";
import { getFeedbackList } from "./db/feedback-queries";

/**
 * Server function to get feedback list for admin moderation.
 * Wraps the DB query in a server boundary to avoid bundling postgres in client.
 */
export const getFeedbackListFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getFeedbackList();
	},
);
