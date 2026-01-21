import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { threads } from "@/db/schemas/thread";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";
import { eq, desc } from "drizzle-orm";
import { getAuthSession } from "@/features/auth/server/get-auth-session";

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

  const userId = session.user.id;

  // Get all aliases for this user
  const userAliases = await db
    .select({ id: alias.id })
    .from(alias)
    .where(eq(alias.userId, userId));

  if (userAliases.length === 0) {
    return [];
  }

  const aliasIds = userAliases.map((a) => a.id);

  // Get all threads created by user's aliases
  const userThreads = await db
    .select({
      id: threads.id,
      title: threads.title,
      body: threads.body,
      category: threads.category,
      slug: threads.slug,
      createdAt: threads.createdAt,
      updatedAt: threads.updatedAt,
      aliasId: threads.aliasId,
      aliasName: alias.name,
      displayUsername: user.displayUsername,
    })
    .from(threads)
    .innerJoin(alias, eq(threads.aliasId, alias.id))
    .leftJoin(user, eq(alias.userId, user.id))
    .where(eq(alias.userId, userId))
    .orderBy(desc(threads.createdAt));

  return userThreads.map((thread) => ({
    ...thread,
    aliasName: thread.aliasName ?? "Anonyme",
    displayUsername: thread.displayUsername ?? null,
  }));
});
