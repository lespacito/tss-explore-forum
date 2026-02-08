import { createServerFn } from "@tanstack/react-start";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getUserPosts } from "../db/post-queries";

/**
 * Server function to get all posts (replies) created by the current user
 *
 * Returns posts with thread and alias information for display
 * Used in /account/profile to show "Mes réponses"
 *
 * Security:
 * - Requires authenticated session
 * - Only returns current user's posts
 * - Respects soft deletes (deletedAt filter)
 *
 * @returns Array of posts with thread and alias data
 */
export const getUserPostsFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getAuthSession();

	if (!session?.user?.id) {
		throw new Error("Non authentifié");
	}

	return await getUserPosts(session.user.id);
});
