import { createServerFn } from "@tanstack/react-start";
import { getAllPublishedThreads } from "../db/thread-queries";

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
