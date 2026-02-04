import { cache } from "react";
import { db } from "@/db";
import { threads } from "../../../db/schemas/thread";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";
import { desc, eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

/**
 * Internal cached function to get all threads with their associated alias and user data.
 * Uses React.cache() to deduplicate multiple calls during a single render.
 */
const getThreadsInternal = cache(async () => {
  const result = await db
    .select({
      id: threads.id,
      title: threads.title,
      body: threads.body,
      slug: threads.slug,
      category: threads.category,
      createdAt: threads.createdAt,
      updatedAt: threads.updatedAt,
      // Informations de l'alias (anonymat respecté)
      aliasName: alias.alias,
      aliasId: alias.id,
      // Informations de l'utilisateur (pour displayUsername)
      displayUsername: user.displayUsername,
    })
    .from(threads)
    .leftJoin(alias, eq(threads.aliasId, alias.id))
    .leftJoin(user, eq(alias.userId, user.id))
    .orderBy(desc(threads.createdAt));

  return result;
});

/**
 * Server function wrapper for client-side calls.
 * For server-side usage, prefer calling getThreadsCached() directly for automatic deduplication.
 */
export const getThreadsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getThreadsInternal();
  },
);

/**
 * Direct export for server-side usage with React.cache() deduplication.
 * Use this in loaders and other server functions instead of getThreadsFn().
 */
export { getThreadsInternal as getThreadsCached };
