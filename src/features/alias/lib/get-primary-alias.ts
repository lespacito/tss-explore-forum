import { getUserPrimaryAlias } from "../server/db/alias-queries";

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
	return await getUserPrimaryAlias(userId);
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
export { getUserAliases } from "../server/db/alias-queries";

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
export { getAliasById } from "../server/db/alias-queries";
