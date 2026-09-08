import { and, desc, eq, isNull } from "drizzle-orm";
import type { ThreadCategory } from "@/data/threads-categories";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { threads } from "@/db/schemas/thread";
import { user } from "@/db/schemas/user";

/**
 * Common thread selection pattern with alias and user data
 * Used across multiple queries to ensure consistency
 */
const threadWithAliasSelect = {
	id: threads.id,
	title: threads.title,
	body: threads.body,
	slug: threads.slug,
	category: threads.category,
 isSensitive: threads.isSensitive,
	createdAt: threads.createdAt,
	updatedAt: threads.updatedAt,
	aliasName: alias.alias,
	aliasId: alias.id,
	displayUsername: alias.alias,
} as const;

/**
 * Get all published threads (non-deleted only)
 * Pure database query - filters by status and soft delete
 *
 * @returns Array of threads with alias and user data, ordered by creation date (newest first)
 *
 * @example
 * ```typescript
 * const threads = await getAllPublishedThreads();
 * console.log(`Found ${threads.length} published threads`);
 * ```
 */
export async function getAllPublishedThreads() {
	const result = await db
		.select(threadWithAliasSelect)
		.from(threads)
		.where(and(eq(threads.status, "published"), isNull(threads.deletedAt)))
		.leftJoin(alias, eq(threads.aliasId, alias.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.orderBy(desc(threads.createdAt));

	// Serialize dates to ISO strings for client consumption
	return result.map((thread) => ({
		...thread,
		createdAt: thread.createdAt.toISOString(),
		updatedAt: thread.updatedAt.toISOString(),
	}));
}

/** Return published, non-deleted threads for one category. */
export async function getPublishedThreadsByCategory(category: ThreadCategory) {
	const result = await db
		.select(threadWithAliasSelect)
		.from(threads)
		.where(
			and(
				eq(threads.status, "published"),
				isNull(threads.deletedAt),
				eq(threads.category, category),
			),
		)
		.leftJoin(alias, eq(threads.aliasId, alias.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.orderBy(desc(threads.createdAt));

	return result.map((thread) => ({
		...thread,
		createdAt: thread.createdAt.toISOString(),
		updatedAt: thread.updatedAt.toISOString(),
	}));
}

/**
 * Get a single thread by its slug
 * Pure database query - returns thread with alias and user data
 *
 * @param slug - The thread slug to search for
 * @returns The thread record or null if not found
 *
 * @example
 * ```typescript
 * const thread = await getThreadBySlug("my-thread-slug");
 * if (thread) {
 *   console.log(`Thread: ${thread.title}`);
 * }
 * ```
 */
export async function getThreadBySlug(slug: string) {
	const [thread] = await db
		.select(threadWithAliasSelect)
		.from(threads)
		.leftJoin(alias, eq(threads.aliasId, alias.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.where(
			and(
				eq(threads.slug, slug),
				eq(threads.status, "published"),
				isNull(threads.deletedAt),
			),
		)
		.limit(1);

	return thread ?? null;
}

/**
 * Get threads by alias ID
 * Pure database query - returns threads created by a specific alias
 *
 * @param aliasId - The alias ID to search for
 * @returns Array of threads for the given alias
 *
 * @example
 * ```typescript
 * const aliasThreads = await getThreadsByAliasId("alias_123");
 * const isFirstPublication = aliasThreads.length === 0;
 * ```
 */
export async function getThreadsByAliasId(aliasId: string) {
	return await db.select().from(threads).where(eq(threads.aliasId, aliasId));
}

/**
 * Get all threads created by a user (via their aliases)
 * Pure database query - returns threads with alias and user data
 *
 * @param userId - The user ID to search for
 * @returns Array of threads created by the user's aliases
 *
 * @example
 * ```typescript
 * const userThreads = await getUserThreads("user_123");
 * console.log(`User has ${userThreads.length} threads`);
 * ```
 */
export async function getUserThreads(
	userId: string,
	statusFilter?: "pending" | "published" | "rejected",
) {
	const conditions = [eq(alias.userId, userId), isNull(threads.deletedAt)];

	if (statusFilter) {
		conditions.push(eq(threads.status, statusFilter));
	}

	const userThreads = await db
		.select({
			id: threads.id,
			title: threads.title,
			body: threads.body,
			category: threads.category,
			slug: threads.slug,
			status: threads.status,
			isSensitive: threads.isSensitive,
			rejectionReason: threads.rejectionReason,
			moderatedAt: threads.moderatedAt,
			createdAt: threads.createdAt,
			updatedAt: threads.updatedAt,
			aliasId: threads.aliasId,
			aliasName: alias.alias,
			displayUsername: alias.alias,
		})
		.from(threads)
		.innerJoin(alias, eq(threads.aliasId, alias.id))
		.leftJoin(user, eq(alias.userId, user.id))
		.where(and(...conditions))
		.orderBy(desc(threads.createdAt));

	return userThreads.map((thread) => ({
		...thread,
		aliasName: thread.aliasName ?? "Anonyme",
		displayUsername: thread.displayUsername ?? null,
	}));
}

/**
 * Create a new thread record
 * Pure database insert - caller must validate and sanitize data
 *
 * @param data - Thread creation data
 * @param data.aliasId - The alias ID creating the thread
 * @param data.title - The thread title
 * @param data.body - The thread body (HTML content - must be sanitized)
 * @param data.category - The thread category
 * @param data.slug - The unique slug for the thread
 * @param data.status - The thread status (pending, published, rejected)
 * @returns The newly created thread record
 *
 * @example
 * ```typescript
 * const newThread = await createThreadRecord({
 *   aliasId: "alias_123",
 *   title: "My Thread",
 *   body: "<p>Sanitized HTML content</p>",
 *   category: "VIOLENCE",
 *   slug: "my-thread-slug",
 *   status: "pending"
 * });
 * ```
 */
export async function createThreadRecord(data: {
	aliasId: string;
	title: string;
	body: string;
	category: ThreadCategory;
	slug: string;
	status: "pending" | "published" | "rejected";
}) {
	const [newThread] = await db.insert(threads).values(data).returning();

	return newThread;
}
