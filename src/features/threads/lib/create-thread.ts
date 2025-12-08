import { db } from "@/db";
import { threads } from "@/features/threads/schema";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";

/**
 * Crée un nouveau thread via l'alias principal de l'utilisateur
 *
 * @param userId - L'identifiant de l'utilisateur
 * @param data - Les données du thread
 * @returns Le thread créé
 * @throws Error si l'utilisateur n'a pas d'alias principal
 *
 * @example
 * ```typescript
 * const newThread = await createThread("user_123", {
 *   title: "Besoin de conseils",
 *   body: "Voici ma question...",
 *   category: "support"
 * });
 * ```
 */
export async function createThread(
  userId: string,
  data: {
    title: string;
    body: string;
    category: string;
  }
) {
  // Validation des données
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Le titre ne peut pas être vide");
  }

  if (data.title.length > 200) {
    throw new Error("Le titre ne peut pas dépasser 200 caractères");
  }

  if (!data.body || data.body.trim().length === 0) {
    throw new Error("Le contenu ne peut pas être vide");
  }

  if (!data.category || data.category.trim().length === 0) {
    throw new Error("La catégorie ne peut pas être vide");
  }

  // Récupérer l'alias principal de l'utilisateur
  const primaryAlias = await getPrimaryAlias(userId);

  if (!primaryAlias) {
    throw new Error(
      "Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support."
    );
  }

  // Créer le thread avec l'alias
  const [newThread] = await db
    .insert(threads)
    .values({
      aliasId: primaryAlias.id,
      title: data.title.trim(),
      body: data.body.trim(),
      category: data.category.trim(),
    })
    .returning();

  return newThread;
}

/**
 * Crée un thread avec un alias spécifique (si l'utilisateur en a plusieurs)
 *
 * @param aliasId - L'identifiant de l'alias à utiliser
 * @param data - Les données du thread
 * @returns Le thread créé
 *
 * @example
 * ```typescript
 * const newThread = await createThreadWithAlias("alias_456", {
 *   title: "Discussion anonyme",
 *   body: "Message anonyme...",
 *   category: "anonymous"
 * });
 * ```
 */
export async function createThreadWithAlias(
  aliasId: string,
  data: {
    title: string;
    body: string;
    category: string;
  }
) {
  // Validation des données
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Le titre ne peut pas être vide");
  }

  if (data.title.length > 200) {
    throw new Error("Le titre ne peut pas dépasser 200 caractères");
  }

  if (!data.body || data.body.trim().length === 0) {
    throw new Error("Le contenu ne peut pas être vide");
  }

  if (!data.category || data.category.trim().length === 0) {
    throw new Error("La catégorie ne peut pas être vide");
  }

  // Créer le thread avec l'alias spécifié
  const [newThread] = await db
    .insert(threads)
    .values({
      aliasId,
      title: data.title.trim(),
      body: data.body.trim(),
      category: data.category.trim(),
    })
    .returning();

  return newThread;
}
