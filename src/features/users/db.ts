import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import type { UserRole } from "@/db/schemas/user";

export async function getUserById(id: string) {
	const rows = await db.select().from(user).where(eq(user.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
	const rows = await db
		.select()
		.from(user)
		.where(eq(user.email, email))
		.limit(1);
	return rows[0] ?? null;
}

export async function getUserByUsername(username: string) {
	const rows = await db
		.select()
		.from(user)
		.where(eq(user.username, username))
		.limit(1);
	return rows[0] ?? null;
}

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

export async function setUserRole(id: string, role: UserRole) {
	const result = await db
		.update(user)
		.set({ role })
		.where(eq(user.id, id))
		.returning();

	return result[0] ?? null;
}

export async function setEmailVerified(id: string, verified: boolean) {
	const result = await db
		.update(user)
		.set({ emailVerified: verified })
		.where(eq(user.id, id))
		.returning();

	return result[0] ?? null;
}
