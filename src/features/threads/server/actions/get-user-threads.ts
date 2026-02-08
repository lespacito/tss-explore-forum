import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getUserThreads } from "../db/thread-queries";

const getUserThreadsSchema = z.object({
	statusFilter: z
		.enum(["pending", "published", "rejected"])
		.optional(),
});

/**
 * Server function to get all threads created by the current user
 *
 * Returns threads with alias information and status data for display
 * Used in /account/profile to show "Mes publications" with status tracking
 *
 * Security:
 * - Requires authenticated session
 * - Only returns current user's threads
 * - Excludes soft-deleted threads (deletedAt IS NULL)
 *
 * @returns Array of threads with alias and status data
 */
export const getUserThreadsFn = createServerFn({
	method: "GET",
})
	.inputValidator((data: unknown) => getUserThreadsSchema.parse(data))
	.handler(async ({ data }) => {
		const session = await getAuthSession();

		if (!session?.user?.id) {
			throw new Error("Non authentifié");
		}

		return await getUserThreads(session.user.id, data.statusFilter);
	});
