import { db } from "@/db";
import { alias } from "@/features/alias/schema";
import { eq, and } from "drizzle-orm";

/**
 * Récupère l'alias principal d'un utilisateur
 *
 * @param userId - L'identifiant de l'utilisateur
 * @returns L'alias principal ou null si aucun n'existe
 *
 * @example
 * ```typescript
 * const primaryAlias = await getPrimaryAlias("user_123");
 * if (primaryAlias) {
 *   console.log(`Alias: ${primaryAlias.alias}`);
 * }
 * ```
 */
export async function getPrimaryAlias(userId: string) {
  const [primaryAlias] = await db
    .select()
    .from(alias)
    .where(and(eq(alias.userId, userId), eq(alias.isPrimary, true)))
    .limit(1);

  return primaryAlias || null;
}

/**
 * Récupère tous les alias d'un utilisateur
 *
 * @param userId - L'identifiant de l'utilisateur
 * @returns Un tableau de tous les alias de l'utilisateur
 *
 * @example
 * ```typescript
 * const allAliases = await getUserAliases("user_123");
 * console.log(`L'utilisateur a ${allAliases.length} alias`);
 * ```
 */
export async function getUserAliases(userId: string) {
  return await db
    .select()
    .from(alias)
    .where(eq(alias.userId, userId))
    .orderBy(alias.createdAt);
}

/**
 * Récupère un alias spécifique par son ID
 *
 * @param aliasId - L'identifiant de l'alias
 * @returns L'alias ou null si non trouvé
 *
 * @example
 * ```typescript
 * const userAlias = await getAliasById("alias_123");
 * if (userAlias) {
 *   console.log(`Alias trouvé: ${userAlias.alias}`);
 * }
 * ```
 */
export async function getAliasById(aliasId: string) {
  const [foundAlias] = await db
    .select()
    .from(alias)
    .where(eq(alias.id, aliasId))
    .limit(1);

  return foundAlias || null;
}
