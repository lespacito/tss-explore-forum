import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { user as userTable } from "@/db/schemas/user";

type User = typeof userTable.$inferSelect;

export async function findUserBySecretCode(
	secretCode: string,
): Promise<User | null> {
	// Sanitize input: trim whitespace and convert to uppercase
	if (!secretCode) {
		return null;
	}

	const normalizedCode = secretCode.trim().toUpperCase();

	// Toujours faire une requête pour éviter timing attack
	const users = await db
		.select()
		.from(userTable)
		.where(eq(userTable.secretCode, normalizedCode))
		.limit(1);

	if (users.length === 0) {
		// Simuler le temps de comparaison même si non trouvé
		// Créer des buffers de même longueur pour éviter l'exception timingSafeEqual
		const inputBuffer = Buffer.from(normalizedCode);
		const dummyBuffer = Buffer.alloc(inputBuffer.length);
		timingSafeEqual(inputBuffer, dummyBuffer);
		return null;
	}

	return users[0];
}
