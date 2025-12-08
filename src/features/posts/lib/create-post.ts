import { db } from "@/db";
import { posts } from "@/features/posts/schema";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";

/**
 * Crée un nouveau post (réponse) dans un thread via l'alias principal
 *
 * @param userId - L'identifiant de l'utilisateur
 * @param data - Les données du post
 * @returns Le post créé
 * @throws Error si l'utilisateur n'a pas d'alias principal ou si les données sont invalides
 *
 * @example
 * ```typescript
 * const newPost = await createPost("user_123", {
 *   threadId: "thread_456",
 *   content: "Voici ma réponse...",
 *   isAnonymous: false,
 *   isSensitive: false,
 *   contentWarnings: ["trigger-warning"]
 * });
 * ```
 */
export async function createPost(
  userId: string,
  data: {
    threadId: string;
    content: string;
    isAnonymous?: boolean;
    isSensitive?: boolean;
    contentWarnings?: string[];
  }
) {
  // Validation des données
  if (!data.content || data.content.trim().length === 0) {
    throw new Error("Le contenu ne peut pas être vide");
  }

  if (data.content.length > 10000) {
    throw new Error("Le contenu ne peut pas dépasser 10000 caractères");
  }

  if (!data.threadId) {
    throw new Error("L'identifiant du thread est requis");
  }

  // Récupérer l'alias principal de l'utilisateur
  const primaryAlias = await getPrimaryAlias(userId);

  if (!primaryAlias) {
    throw new Error(
      "Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support."
    );
  }

  // Créer le post avec l'alias
  const [newPost] = await db
    .insert(posts)
    .values({
      aliasId: primaryAlias.id,
      threadId: data.threadId,
      content: data.content.trim(),
      isAnonymous: data.isAnonymous ?? false,
      isSensitive: data.isSensitive ?? false,
      contentWarnings: data.contentWarnings ?? [],
    })
    .returning();

  return newPost;
}

/**
 * Crée un post avec un alias spécifique (si l'utilisateur en a plusieurs)
 *
 * @param aliasId - L'identifiant de l'alias à utiliser
 * @param data - Les données du post
 * @returns Le post créé
 *
 * @example
 * ```typescript
 * const newPost = await createPostWithAlias("alias_456", {
 *   threadId: "thread_789",
 *   content: "Réponse avec alias spécifique...",
 *   isAnonymous: true,
 *   isSensitive: true,
 *   contentWarnings: ["violence", "self-harm"]
 * });
 * ```
 */
export async function createPostWithAlias(
  aliasId: string,
  data: {
    threadId: string;
    content: string;
    isAnonymous?: boolean;
    isSensitive?: boolean;
    contentWarnings?: string[];
  }
) {
  // Validation des données
  if (!data.content || data.content.trim().length === 0) {
    throw new Error("Le contenu ne peut pas être vide");
  }

  if (data.content.length > 10000) {
    throw new Error("Le contenu ne peut pas dépasser 10000 caractères");
  }

  if (!data.threadId) {
    throw new Error("L'identifiant du thread est requis");
  }

  // Créer le post avec l'alias spécifié
  const [newPost] = await db
    .insert(posts)
    .values({
      aliasId,
      threadId: data.threadId,
      content: data.content.trim(),
      isAnonymous: data.isAnonymous ?? false,
      isSensitive: data.isSensitive ?? false,
      contentWarnings: data.contentWarnings ?? [],
    })
    .returning();

  return newPost;
}
