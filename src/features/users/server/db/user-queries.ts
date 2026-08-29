import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { UserRole } from "@/db/schemas/user";

/**
 * Get user by ID
 * Pure database query - no business logic
 *
 * @param id - The user ID to search for
 * @returns The user record or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserById("user_123");
 * if (user) {
 *   console.log(`Found user: ${user.email}`);
 * }
 * ```
 */
export async function getUserById(id: string) {
	const rows = await db.select().from(user).where(eq(user.id, id)).limit(1);
	return rows[0] ?? null;
}

/**
 * Get user by email address
 * Pure database query - no business logic
 *
 * @param email - The email address to search for
 * @returns The user record or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserByEmail("user@example.com");
 * if (user) {
 *   console.log(`Found user: ${user.id}`);
 * }
 * ```
 */
export async function getUserByEmail(email: string) {
	const rows = await db
		.select()
		.from(user)
		.where(eq(user.email, email))
		.limit(1);
	return rows[0] ?? null;
}

/**
 * Get user by username
 * Pure database query - no business logic
 *
 * @param username - The username to search for
 * @returns The user record or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserByUsername("john_doe");
 * if (user) {
 *   console.log(`Found user: ${user.id}`);
 * }
 * ```
 */
export async function getUserByUsername(username: string) {
	const rows = await db
		.select()
		.from(user)
		.where(eq(user.username, username))
		.limit(1);
	return rows[0] ?? null;
}

/**
 * Update user profile fields
 * Pure database update - validates which fields are provided
 *
 * @param id - The user ID to update
 * @param changes - Partial object with fields to update
 * @param changes.name - Optional new name
 * @param changes.image - Optional new image URL (null to remove)
 * @param changes.displayUsername - Optional new display username (null to remove)
 * @returns The updated user record or null if not found
 *
 * @example
 * ```typescript
 * const updatedUser = await updateUserProfile("user_123", {
 *   name: "John Doe",
 *   displayUsername: "johndoe"
 * });
 * ```
 */
export async function updateUserProfile(
	id: string,
	changes: Partial<{
		name: string;
		image: string | null;
		displayUsername: string | null;
	}>,
) {
	const updateData: Record<string, any> = {};

	if (changes.name !== undefined) {
		updateData.name = changes.name;
	}
	if (changes.image !== undefined) {
		updateData.image = changes.image;
	}
	if (changes.displayUsername !== undefined) {
		updateData.displayUsername = changes.displayUsername;
	}

	if (Object.keys(updateData).length === 0) {
		return await getUserById(id);
	}

	const result = await db
		.update(user)
		.set(updateData)
		.where(eq(user.id, id))
		.returning();

	return result[0] ?? null;
}

/**
 * Set user role
 * Pure database update - changes user's role
 *
 * @param id - The user ID to update
 * @param role - The new role to assign
 * @returns The updated user record or null if not found
 *
 * @example
 * ```typescript
 * const updatedUser = await setUserRole("user_123", "moderator");
 * ```
 */
export async function setUserRole(id: string, role: UserRole) {
	const result = await db
		.update(user)
		.set({ role })
		.where(eq(user.id, id))
		.returning();

	return result[0] ?? null;
}

/**
 * Set email verification status
 * Pure database update - marks email as verified or unverified
 *
 * @param id - The user ID to update
 * @param verified - True to mark email as verified, false otherwise
 * @returns The updated user record or null if not found
 *
 * @example
 * ```typescript
 * const updatedUser = await setEmailVerified("user_123", true);
 * ```
 */
export async function setEmailVerified(id: string, verified: boolean) {
	const result = await db
		.update(user)
		.set({ emailVerified: verified })
		.where(eq(user.id, id))
		.returning();

	return result[0] ?? null;
}
