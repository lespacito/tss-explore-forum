import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { logger } from "@/lib/logger/server";

/**
 * Server Function pour lier un compte anonyme à un compte enregistré
 *
 * Story 1.4 - Task 4: Implémenter liaison de compte anonyme
 *
 * Fonctionnalités:
 * - Vérification d'authentification (session active requise)
 * - Validation que le newUserId correspond à la session
 * - Migration des alias anonymes vers compte enregistré
 * - Préservation du compte anonyme et du secretCode (AC2)
 * - Logging pour audit trail
 *
 * Flux:
 * 1. Vérifier l'authentification
 * 2. Migrer tous les alias de l'anonyme vers le nouveau compte
 * 3. Logger la liaison pour audit
 * 4. Retourner le nombre d'alias migrés
 *
 * Note importante:
 * Les threads, posts et comments suivent automatiquement car ils sont liés aux alias
 * via aliasId, pas directement au user.
 * Le compte anonyme N'EST PAS supprimé pour préserver le secretCode (AC2).
 */
export const linkAnonymousAccountFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			anonymousUserId: z.string(),
			newUserId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const { newUserId, anonymousUserId } = data;

		// Vérification d'authentification
		const authContext = await getAuthSession();

		if (!authContext.isAuthenticated || !authContext.user) {
			logger.warn("Unauthenticated attempt to link anonymous account", {
				anonymousUserId,
				newUserId,
			});
			return {
				success: false,
				error: "Vous devez être connecté pour lier un compte",
			};
		}

		// Vérifier que le newUserId correspond à l'utilisateur authentifié
		if (authContext.user.id !== newUserId) {
			logger.warn("User ID mismatch in link anonymous account", {
				sessionUserId: authContext.user.id,
				claimedNewUserId: newUserId,
				anonymousUserId,
			});
			return {
				success: false,
				error: "Identifiant utilisateur invalide",
			};
		}

		try {
			// Migrer tous les alias de l'utilisateur anonyme vers le nouveau compte
			// Tous les threads, posts et comments suivent automatiquement car ils sont liés aux alias
			const updatedAliases = await db
				.update(alias)
				.set({ userId: newUserId })
				.where(eq(alias.userId, anonymousUserId))
				.returning();

			logger.info("Aliases migrated to new account", {
				anonymousUserId,
				newUserId,
				aliasCount: updatedAliases.length,
			});

			// Le compte anonyme est préservé avec son secretCode (AC2)
			// L'utilisateur peut toujours récupérer ses données via le code secret

			return {
				success: true,
				linkedPostsCount: updatedAliases.length,
			};
		} catch (error: any) {
			logger.error("Failed to link anonymous account", {
				anonymousUserId,
				newUserId,
				error: error.message,
				stack: error.stack,
			});

			return {
				success: false,
				error: "Erreur lors de la liaison du compte",
			};
		}
	});
