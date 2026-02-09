import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { posts } from "@/db/schemas/post";
import { threads } from "@/db/schemas/thread";
import { user } from "@/db/schemas/user";

/**
 * Common post selection pattern with alias and user data
 * Used across multiple queries to ensure consistency
 */
const postWithAliasSelect = {
	id: posts.id,
	content: posts.content,
	threadId: posts.threadId,
	isSensitive: posts.isSensitive,
	contentWarnings: posts.contentWarnings,
	createdAt: posts.createdAt,
	updatedAt: posts.updatedAt,
	aliasName: alias.alias,
	aliasId: alias.id,
	displayUsername: user.displayUsername,
} as const;

/**
 * Get all posts (non-deleted only)
 * Pure database query - filters by soft delete, includes thread info
 *
 * @returns Array of posts with alias, user, and thread data, ordered by creation date (newest first)
 *
 * @example
 * ```typescript
 * const posts = await getAllPosts();
 * console.log(`Found ${posts.length} posts`);
 * ```
 */
export async function getAllPosts() {
	const result = await db
		.select({
			...postWithAliasSelect,
			threadTitle: threads.title,
			threadCategory: threads.category,
		})
		.from(posts)
		.leftJoin(alias, eq(posts.aliasId, alias.id))
		.leftJoin(threads, eq(posts.threadId, threads.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.where(isNull(posts.deletedAt))
		.orderBy(desc(posts.createdAt));

	return result;
}

/**
 * Get posts by thread ID
 * Pure database query - returns posts for a specific thread
 *
 * @param threadId - The thread ID to filter by
 * @returns Array of posts in the thread with alias and user data
 *
 * @example
 * ```typescript
 * const threadPosts = await getPostsByThreadId("thread-uuid");
 * console.log(`Thread has ${threadPosts.length} replies`);
 * ```
 */
export async function getPostsByThreadId(threadId: string) {
	const result = await db
		.select(postWithAliasSelect)
		.from(posts)
		.leftJoin(alias, eq(posts.aliasId, alias.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.where(and(eq(posts.threadId, threadId), isNull(posts.deletedAt)))
		.orderBy(desc(posts.createdAt));

	return result;
}

/**
 * Get all posts created by a user (via their aliases)
 * Pure database query - returns posts with thread, alias and user data
 *
 * @param userId - The user ID to search for
 * @returns Array of posts created by the user's aliases
 *
 * @example
 * ```typescript
 * const userPosts = await getUserPosts("user_123");
 * console.log(`User has ${userPosts.length} posts`);
 * ```
 */
export async function getUserPosts(userId: string) {
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
			aliasName: alias.alias,
			displayUsername: user.displayUsername,
			threadTitle: threads.title,
			threadSlug: threads.slug,
			threadCategory: threads.category,
		})
		.from(posts)
		.innerJoin(alias, eq(posts.aliasId, alias.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.leftJoin(threads, eq(posts.threadId, threads.id))
		.where(and(eq(alias.userId, userId), isNull(posts.deletedAt)))
		.orderBy(desc(posts.createdAt));

	return userPosts.map((post) => ({
		...post,
		aliasName: post.aliasName ?? "Anonyme",
		displayUsername: post.displayUsername ?? null,
		threadTitle: post.threadTitle ?? "Thread supprimé",
		threadSlug: post.threadSlug ?? null,
		threadCategory: post.threadCategory ?? "discussion",
	}));
}

/**
 * Get thread category by thread ID
 * Pure database query - used to check if thread is in sensitive category
 *
 * @param threadId - The thread ID to search for
 * @returns The thread category or null if thread not found
 *
 * @example
 * ```typescript
 * const category = await getThreadCategory("thread-uuid");
 * if (category && isThreadCategorySensitive(category)) {
 *   // Handle sensitive content
 * }
 * ```
 */
export async function getThreadCategory(threadId: string) {
	const [thread] = await db
		.select({ category: threads.category })
		.from(threads)
		.where(eq(threads.id, threadId))
		.limit(1);

	return thread ?? null;
}

/**
 * Create a new post record
 * Pure database insert - caller must validate and sanitize data
 *
 * @param data - Post creation data
 * @param data.aliasId - The alias ID creating the post
 * @param data.threadId - The thread ID to post in
 * @param data.content - The post content (must be sanitized)
 * @param data.isSensitive - Whether content is marked as sensitive
 * @param data.contentWarnings - Array of content warning tags
 * @returns The newly created post record
 *
 * @example
 * ```typescript
 * const newPost = await createPostRecord({
 *   aliasId: "alias_123",
 *   threadId: "thread-uuid",
 *   content: "Sanitized content",
 *   isSensitive: false,
 *   contentWarnings: []
 * });
 * ```
 */
export async function createPostRecord(data: {
	aliasId: string;
	threadId: string;
	content: string;
	isSensitive: boolean;
	contentWarnings: string[];
}) {
	const [newPost] = await db.insert(posts).values(data).returning();

	return newPost;
}
