import { cache } from "react";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { eq, and } from "drizzle-orm";

/**
 * Récupère l'alias principal d'un utilisateur
 *
 * Uses React.cache() for automatic deduplication during server-side rendering.
 * If called multiple times with the same userId in a single request, only one DB query is executed.
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
export const getPrimaryAlias = cache(async (userId: string) => {
  const [primaryAlias] = await db
    .select()
    .from(alias)
    .where(and(eq(alias.userId, userId), eq(alias.isPrimary, true)))
    .limit(1);

  return primaryAlias || null;
});

/**
 * Récupère tous les alias d'un utilisateur
 *
 * Uses React.cache() for automatic deduplication during server-side rendering.
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
export const getUserAliases = cache(async (userId: string) => {
  return await db
    .select()
    .from(alias)
    .where(eq(alias.userId, userId))
    .orderBy(alias.createdAt);
});

/**
 * Récupère un alias spécifique par son ID
 *
 * Uses React.cache() for automatic deduplication during server-side rendering.
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
export const getAliasById = cache(async (aliasId: string) => {
  const [foundAlias] = await db
    .select()
    .from(alias)
    .where(eq(alias.id, aliasId))
    .limit(1);

  return foundAlias || null;
});
