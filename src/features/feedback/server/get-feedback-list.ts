import { createServerFn } from "@tanstack/react-start";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { assertModerator } from "@/features/moderation/server/thread-moderation";
import { getFeedbackList } from "./db/feedback-queries";

/**
 * Server function to get feedback list for admin moderation.
 * Wraps the DB query in a server boundary to avoid bundling postgres in client.
 */
export const getFeedbackListFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getAuthSession();
		assertModerator(session.user);
		return await getFeedbackList();
	},
);
