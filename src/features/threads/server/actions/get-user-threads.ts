import { createServerFn } from "@tanstack/react-start";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getUserThreads } from "../db/thread-queries";

/**
 * Server function to get all threads created by the current user
 *
 * Returns threads with alias information for display
 * Used in /account/profile to show "Mes publications"
 *
 * Security:
 * - Requires authenticated session
 * - Only returns current user's threads
 * - Respects soft deletes (deletedAt filter)
 *
 * @returns Array of threads with alias data
 */
export const getUserThreadsFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const session = await getAuthSession();

	if (!session?.user?.id) {
		throw new Error("Non authentifié");
	}

	return await getUserThreads(session.user.id);
});
