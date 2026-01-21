import { db } from "@/db";
import { threads } from "../../../db/schemas/thread";
import { user } from "@/db/schemas/user";
import { z } from "zod";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { createServerFn } from "@tanstack/react-start";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import { generateUniqueSlug } from "@/lib/utils/slug-utils";
import {
  checkArcjet,
  handleArcjetDenied,
} from "@/features/auth/lib/security/protected-server-fn";
import { generateSecretCodeLogic } from "@/features/auth/server/generate-secret-code-fn";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger/server";

const createThreadSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre ne peut pas être vide")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  body: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
});

// Type pour le retour de createThreadFn
type CreateThreadResult =
  | {
      success: true;
      thread: typeof threads.$inferSelect;
      secretCode?: string;
      isFirstPublication?: boolean;
    }
  | {
      success: false;
      error: string;
    };

export const createThreadFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createThreadSchema.parse(data))
  .handler(async ({ data }) => {
    const decision = await checkArcjet({
      path: "/threads/create",
    });

    if (decision.isDenied()) {
      return handleArcjetDenied(decision);
    }

    const session = await getAuthSession();
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // Récupérer l'alias principal de l'utilisateur
    const primaryAlias = await getPrimaryAlias(session.user.id);

    if (!primaryAlias) {
      throw new Error(
        "Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support.",
      );
    }

    const title = data.title.trim();
    const body = data.body.trim();
    const category = data.category.trim();

    // Générer le slug unique à partir du titre
    const slug = generateUniqueSlug(title);

    // Vérifier si c'est la première publication de l'utilisateur (Task 4.1)
    const existingThreads = await db
      .select()
      .from(threads)
      .where(eq(threads.aliasId, primaryAlias.id))
      .limit(1);

    const isFirstPublication = existingThreads.length === 0;

    // Créer le thread avec l'alias et le slug
    const [newThread] = await db
      .insert(threads)
      .values({
        aliasId: primaryAlias.id,
        title,
        body,
        category,
        slug,
      })
      .returning();

    // Task 4.2: Générer code secret après première publication pour utilisateurs anonymes
    if (isFirstPublication) {
      // Vérifier si l'utilisateur est anonyme (isAnonymous === true)
      const [currentUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      if (currentUser && currentUser.isAnonymous === true) {
        // Task 4.3: generateSecretCodeLogic gère l'idempotence (code existant)
        const codeResult = await generateSecretCodeLogic(session);

        if (codeResult.success) {
          logger.info("Secret code generated for first publication", {
            userId: session.user.id,
            isExisting: codeResult.isExisting,
          });

          // Retourner le thread avec le code secret généré
          const response = {
            success: true,
            thread: newThread,
            secretCode: codeResult.secretCode,
            isFirstPublication: true,
          };

          return response;
        } else {
          // Ne pas bloquer la création du thread si la génération échoue
          logger.error("Secret code generation failed but thread created", {
            userId: session.user.id,
            error: codeResult.error,
          });
        }
      }
    }

    return { success: true, thread: newThread };
  });
