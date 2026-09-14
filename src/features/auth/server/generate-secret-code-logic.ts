import crypto from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { account, user } from "@/db/schemas/user";
import { ensureUniqueCode } from "@/features/auth/lib/generate-secret-code";
import type { getAuthSession } from "@/features/auth/server/get-auth-session";
import { logger } from "@/lib/logger/server";

type GenerateSecretCodeResult =
	| { success: true; secretCode: string; isExisting: boolean }
	| { success: false; error: string };

/**
 * Business logic for generating secret codes (extracted for testing)
 *
 * @param session - Auth session from getAuthSession()
 * @param dbInstance - Database instance (for dependency injection in tests)
 * @returns Promise resolving to result object
 */
export async function generateSecretCodeLogic(
	session: Awaited<ReturnType<typeof getAuthSession>> | null,
	dbInstance: typeof db = db,
): Promise<GenerateSecretCodeResult> {
	try {
		if (!session?.user?.id) {
			return { success: false, error: "Non authentifié" };
		}

		const userId = session.user.id;

		// Check if user already has a secret code (from session data)
		if (session.user.secretCode) {
			logger.info("Secret code already exists", { userId });
			return {
				success: true,
				secretCode: session.user.secretCode,
				isExisting: true,
			};
		}

		// Verify user is anonymous (isAnonymous must be true)
		const [currentUser] = await dbInstance
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);

		if (!currentUser) {
			return { success: false, error: "Utilisateur introuvable" };
		}

		// Registered users (non-anonymous) cannot have secret codes
		if (currentUser.isAnonymous !== true) {
			return {
				success: false,
				error: "Cette fonctionnalité est réservée aux utilisateurs anonymes",
			};
		}

		// Double-check for existing code (edge case: session data stale)
		if (currentUser.secretCode) {
			logger.info("Secret code already exists", { userId });
			return {
				success: true,
				secretCode: currentUser.secretCode,
				isExisting: true,
			};
		}

		// Generate new unique secret code
		const candidateCode = await ensureUniqueCode(dbInstance);

		// Only the first concurrent request may assign a code. Every contender then
		// reads back the same stable value.
		const [assignedUser] = await dbInstance
			.update(user)
			.set({
				secretCode: candidateCode,
				secretCodeGeneratedAt: new Date(),
			})
			.where(and(eq(user.id, userId), isNull(user.secretCode)))
			.returning({ secretCode: user.secretCode });

		const secretCode =
			assignedUser?.secretCode ??
			(
				await dbInstance
					.select({ secretCode: user.secretCode })
					.from(user)
					.where(eq(user.id, userId))
					.limit(1)
			)[0]?.secretCode;

		if (!secretCode) {
			return {
				success: false,
				error: "Impossible de générer le code de récupération",
			};
		}

		// The provider/account pair is unique in the schema. This insert is therefore
		// idempotent even when two first submissions race.
		try {
			await dbInstance
				.insert(account)
				.values({
					id: crypto.randomUUID(),
					accountId: userId,
					providerId: "secret-code",
					userId: userId,
				})
				.onConflictDoNothing({
					target: [account.providerId, account.accountId],
				});
		} catch (accountError) {
			// Ne pas bloquer la génération du secret code si la création d'account échoue
			// L'account sera créé au premier login (fallback dans auth.ts)
			logger.warn("Failed to create secret-code account during generation", {
				userId,
				error:
					accountError instanceof Error
						? accountError.message
						: String(accountError),
			});
		}

		logger.info("Secret code generated", {
			userId,
			// SECURITY: Never log the actual code value
			codeLength: secretCode.length,
		});

		return {
			success: true,
			secretCode,
			isExisting: false,
		};
	} catch (error) {
		logger.error("Secret code generation failed", { error });
		return {
			success: false,
			error: "Impossible de générer le code de récupération",
		};
	}
}
