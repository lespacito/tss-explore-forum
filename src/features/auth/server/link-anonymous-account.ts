import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger/server";

/**
 * Server Function pour lier un compte anonyme à un compte enregistré
 *
 * Story 1.4 - Task 4: Implémenter liaison de compte anonyme
 *
 * Fonctionnalités:
 * - Migration des alias anonymes vers compte enregistré
 * - Suppression du compte anonyme après migration
 * - Logging pour audit trail
 *
 * Flux:
 * 1. Migrer tous les alias de l'anonyme vers le nouveau compte
 * 2. Supprimer le compte anonyme (cleanup)
 * 3. Logger la liaison pour audit
 * 4. Retourner le nombre d'alias migrés
 *
 * Note importante:
 * Les threads, posts et comments suivent automatiquement car ils sont liés aux alias
 * via aliasId, pas directement au user.
 */
export const linkAnonymousAccountFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      anonymousUserId: z.string(),
      newUserId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const { newUserId, anonymousUserId } = data;

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

      // Supprimer le compte anonyme après migration pour éviter confusion
      try {
        await db.delete(user).where(eq(user.id, anonymousUserId));

        logger.info("Anonymous user account deleted after successful migration", {
          anonymousUserId,
          newUserId,
        });
      } catch (deleteError: any) {
        // Non-critical - log warning but don't fail the migration
        logger.warn("Failed to delete anonymous user account (non-critical)", {
          anonymousUserId,
          error: deleteError.message,
        });
      }

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
