import { db } from "@/db";
import { comments } from "@/features/posts/schema";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";

/**
 * Crée un nouveau commentaire sur un post via l'alias principal
 *
 * @param userId - L'identifiant de l'utilisateur
 * @param data - Les données du commentaire
 * @returns Le commentaire créé
 * @throws Error si l'utilisateur n'a pas d'alias principal ou si les données sont invalides
 *
 * @example
 * ```typescript
 * const newComment = await createComment("user_123", {
 *   postId: "post_456",
 *   content: "Merci pour cette réponse !",
 *   parentId: null, // Commentaire principal
 *   isAnonymous: false
 * });
 * ```
 */
export async function createComment(
  userId: string,
  data: {
    postId: string;
    content: string;
    parentId?: string | null;
    isAnonymous?: boolean;
  }
) {
  // Validation des données
  if (!data.content || data.content.trim().length === 0) {
    throw new Error("Le contenu du commentaire ne peut pas être vide");
  }

  if (data.content.length > 5000) {
    throw new Error("Le commentaire ne peut pas dépasser 5000 caractères");
  }

  if (!data.postId) {
    throw new Error("L'identifiant du post est requis");
  }

  // Récupérer l'alias principal de l'utilisateur
  const primaryAlias = await getPrimaryAlias(userId);

  if (!primaryAlias) {
    throw new Error(
      "Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support."
    );
  }

  // Créer le commentaire avec l'alias
  const [newComment] = await db
    .insert(comments)
    .values({
      aliasId: primaryAlias.id,
      postId: data.postId,
      content: data.content.trim(),
      parentId: data.parentId ?? null,
      isAnonymous: data.isAnonymous ?? false,
    })
    .returning();

  return newComment;
}

/**
 * Crée un commentaire avec un alias spécifique (si l'utilisateur en a plusieurs)
 *
 * @param aliasId - L'identifiant de l'alias à utiliser
 * @param data - Les données du commentaire
 * @returns Le commentaire créé
 *
 * @example
 * ```typescript
 * const newComment = await createCommentWithAlias("alias_456", {
 *   postId: "post_789",
 *   content: "Commentaire anonyme...",
 *   parentId: "comment_123", // Réponse à un autre commentaire
 *   isAnonymous: true
 * });
 * ```
 */
export async function createCommentWithAlias(
  aliasId: string,
  data: {
    postId: string;
    content: string;
    parentId?: string | null;
    isAnonymous?: boolean;
  }
) {
  // Validation des données
  if (!data.content || data.content.trim().length === 0) {
    throw new Error("Le contenu du commentaire ne peut pas être vide");
  }

  if (data.content.length > 5000) {
    throw new Error("Le commentaire ne peut pas dépasser 5000 caractères");
  }

  if (!data.postId) {
    throw new Error("L'identifiant du post est requis");
  }

  // Créer le commentaire avec l'alias spécifié
  const [newComment] = await db
    .insert(comments)
    .values({
      aliasId,
      postId: data.postId,
      content: data.content.trim(),
      parentId: data.parentId ?? null,
      isAnonymous: data.isAnonymous ?? false,
    })
    .returning();

  return newComment;
}

/**
 * Crée une réponse à un commentaire existant
 *
 * @param userId - L'identifiant de l'utilisateur
 * @param data - Les données de la réponse
 * @returns Le commentaire créé
 *
 * @example
 * ```typescript
 * const reply = await createCommentReply("user_123", {
 *   postId: "post_456",
 *   parentCommentId: "comment_789",
 *   content: "Je suis d'accord avec toi !",
 *   isAnonymous: false
 * });
 * ```
 */
export async function createCommentReply(
  userId: string,
  data: {
    postId: string;
    parentCommentId: string;
    content: string;
    isAnonymous?: boolean;
  }
) {
  if (!data.parentCommentId) {
    throw new Error("L'identifiant du commentaire parent est requis");
  }

  return createComment(userId, {
    postId: data.postId,
    content: data.content,
    parentId: data.parentCommentId,
    isAnonymous: data.isAnonymous,
  });
}
