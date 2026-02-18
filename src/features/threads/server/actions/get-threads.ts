import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ThreadCategory } from "@/data/threads-categories";
import {
	getAllPublishedThreads,
	getPublishedThreadsByCategory,
} from "../db/thread-queries";

/**
 * Server function to get all published threads
 * Pure orchestration - delegates to DB layer
 *
 * Story 2.4: Only show published, non-deleted threads (moderation + soft delete)
 */
export const getThreadsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getAllPublishedThreads();
	},
);

// Export as alias for compatibility with optimized loaders
export { getThreadsFn as getThreadsCached };

/**
 * Server function to get published threads filtered by category
 * Pure orchestration - delegates to DB layer (public route, no auth required)
 *
 * Story 3.2: Server-side category filtering for performance (AC2)
 */
export const getThreadsByCategoryFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) =>
		z
			.object({
				category: z.enum(["VIOLENCE", "ABUS", "TEMOIN", "DETRESSE", "AUTRE"]),
			})
			.parse(data),
	)
	.handler(async ({ data }) => {
		return await getPublishedThreadsByCategory(data.category as ThreadCategory);
	});
