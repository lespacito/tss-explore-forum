import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/db/schemas/post";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger/server";

/**
 * Server Function pour lier un compte anonyme à un compte enregistré
 *
 * Story 1.4 - Task 4: Implémenter liaison de compte anonyme
 *
 * Fonctionnalités:
 * - Migration des posts anonymes vers compte enregistré
 * - Préservation du secretCode pour compatibilité rétroactive
 * - Logging pour audit trail
 * - Vérification d'authentification
 *
 * Flux:
 * 1. Vérifier que l'utilisateur est authentifié
 * 2. Migrer tous les posts de l'anonyme vers le nouveau compte
 * 3. Logger la liaison pour audit
 * 4. Retourner le nombre de posts migrés
 *
 * Note importante:
 * Le secretCode de l'utilisateur anonyme est préservé dans la table users.
 * L'ancien compte anonyme reste accessible via son code si nécessaire.
 */
export const linkAnonymousAccountFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ anonymousUserId: z.string() }))
  .handler(async ({ data }) => {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: (this as any).request.headers,
    });

    if (!session?.user) {
      logger.warn("Attempted to link anonymous account without authentication");
      return { success: false, error: "Non authentifié" };
    }

    const newUserId = session.user.id;
    const anonymousUserId = data.anonymousUserId;

    try {
      // Migrer tous les posts de l'utilisateur anonyme vers le nouveau compte
      // Utilise une transaction implicite via Drizzle ORM
      const updatedPosts = await db
        .update(posts)
        .set({ authorId: newUserId })
        .where(eq(posts.authorId, anonymousUserId))
        .returning();

      logger.info("Anonymous account linked", {
        anonymousUserId,
        newUserId,
        postsCount: updatedPosts.length,
      });

      // Note : Le secretCode est préservé dans la table users
      // L'ancien compte anonyme reste accessible via le code si besoin
      // Cela permet la récupération ultérieure si nécessaire

      return {
        success: true,
        linkedPostsCount: updatedPosts.length,
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
