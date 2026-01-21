import { createServerFn } from "@tanstack/react-start";
import { db } from "@/db";
import { posts } from "@/db/schemas/post";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";
import { threads } from "@/db/schemas/thread";
import { eq, desc, isNull } from "drizzle-orm";
import { getAuthSession } from "@/features/auth/server/get-auth-session";

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

  // Get all posts created by user's aliases
  const userPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      threadId: posts.threadId,
      isSensitive: posts.isSensitive,
      contentWarnings: posts.contentWarnings,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      aliasId: posts.aliasId,
      aliasName: alias.name,
      displayUsername: user.displayUsername,
      threadTitle: threads.title,
      threadSlug: threads.slug,
      threadCategory: threads.category,
    })
    .from(posts)
    .innerJoin(alias, eq(posts.aliasId, alias.id))
    .leftJoin(user, eq(alias.userId, user.id))
    .leftJoin(threads, eq(posts.threadId, threads.id))
    .where(eq(alias.userId, userId))
    .orderBy(desc(posts.createdAt));

  return userPosts.map((post) => ({
    ...post,
    aliasName: post.aliasName ?? "Anonyme",
    displayUsername: post.displayUsername ?? null,
    threadTitle: post.threadTitle ?? "Thread supprimé",
    threadSlug: post.threadSlug ?? null,
    threadCategory: post.threadCategory ?? "discussion",
  }));
});
