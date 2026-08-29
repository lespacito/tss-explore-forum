import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";

/**
 * Find alias by name
 * Pure database query - no business logic
 *
 * @param aliasName - The alias name to search for
 * @returns The alias record or null if not found
 *
 * @example
 * ```typescript
 * const existing = await findAliasByName("MonPseudo-2024");
 * if (existing) {
 *   console.log(`Alias ${existing.alias} already exists`);
 * }
 * ```
 */
export async function findAliasByName(aliasName: string) {
	const [existing] = await db
		.select()
		.from(alias)
		.where(eq(alias.alias, aliasName))
		.limit(1);

	return existing ?? null;
}

/**
 * Check if alias name is available
 * Convenience wrapper around findAliasByName
 *
 * @param aliasName - The alias name to check
 * @returns true if available (not found), false if taken
 *
 * @example
 * ```typescript
 * const available = await isAliasNameAvailable("MonPseudo-2024");
 * if (available) {
 *   // Proceed with creation
 * }
 * ```
 */
export async function isAliasNameAvailable(
	aliasName: string,
): Promise<boolean> {
	const existing = await findAliasByName(aliasName);
	return !existing;
}

/**
 * Get user's primary alias
 * Pure database query - returns the alias marked as primary for a user
 *
 * @param userId - The user ID to search for
 * @returns The primary alias record or null if not found
 *
 * @example
 * ```typescript
 * const primaryAlias = await getUserPrimaryAlias("user_123");
 * if (primaryAlias) {
 *   console.log(`Primary alias: ${primaryAlias.alias}`);
 * }
 * ```
 */
export async function getUserPrimaryAlias(userId: string) {
	const [primaryAlias] = await db
		.select()
		.from(alias)
		.where(and(eq(alias.userId, userId), eq(alias.isPrimary, true)))
		.limit(1);

	return primaryAlias ?? null;
}

/**
 * Get all aliases for a user
 * Pure database query - returns all alias records for a user
 *
 * @param userId - The user ID to search for
 * @returns Array of alias records (empty array if none found)
 *
 * @example
 * ```typescript
 * const aliases = await getUserAliases("user_123");
 * console.log(`User has ${aliases.length} aliases`);
 * ```
 */
export async function getUserAliases(userId: string) {
	return await db
		.select()
		.from(alias)
		.where(eq(alias.userId, userId))
		.orderBy(alias.createdAt);
}

/**
 * Get alias by ID
 * Pure database query - finds an alias by its unique ID
 *
 * @param aliasId - The alias ID to search for
 * @returns The alias record or null if not found
 *
 * @example
 * ```typescript
 * const userAlias = await getAliasById("alias_123");
 * if (userAlias) {
 *   console.log(`Found alias: ${userAlias.alias}`);
 * }
 * ```
 */
export async function getAliasById(aliasId: string) {
	const [foundAlias] = await db
		.select()
		.from(alias)
		.where(eq(alias.id, aliasId))
		.limit(1);

	return foundAlias ?? null;
}

/**
 * Create a new alias record
 * Pure database insert - no uniqueness validation (caller's responsibility)
 *
 * @param data - Alias creation data
 * @param data.userId - The user ID this alias belongs to
 * @param data.alias - The alias name/display name
 * @param data.isPrimary - Whether this is the user's primary alias
 * @param data.rotationEnabled - Whether alias rotation is enabled
 * @returns The newly created alias record
 *
 * @example
 * ```typescript
 * const newAlias = await createAliasRecord({
 *   userId: "user_123",
 *   alias: "MonPseudo-2024",
 *   isPrimary: true,
 *   rotationEnabled: false,
 * });
 * ```
 */
export async function createAliasRecord(data: {
	userId: string;
	alias: string;
	isPrimary: boolean;
	rotationEnabled: boolean;
}) {
	const [newAlias] = await db.insert(alias).values(data).returning();

	return newAlias;
}
