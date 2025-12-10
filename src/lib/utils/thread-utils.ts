/**
 * Liste des catégories de threads considérées comme sensibles.
 * Pour ces catégories, l'alias sera affiché au lieu du displayUsername.
 */
const SENSITIVE_CATEGORIES = ["temoignage", "urgent", "support"];

/**
 * Vérifie si une catégorie de thread est considérée comme sensible.
 * @param category - La catégorie du thread
 * @returns true si la catégorie est sensible, false sinon
 */
export function isThreadCategorySensitive(category: string): boolean {
  if (!category) return true;
  const normalized = category.toLowerCase();
  return SENSITIVE_CATEGORIES.includes(normalized);
}

/**
 * Détermine le nom d'auteur à afficher selon les règles de sensibilité.
 * @param options - Options pour déterminer le nom à afficher
 * @returns Le nom à afficher (alias ou displayUsername)
 */
export function getAuthorDisplayName(options: {
  isSensitive: boolean;
  threadCategory: string;
  aliasName: string | null;
  displayUsername: string | null;
}): string {
  const { isSensitive, threadCategory, aliasName, displayUsername } = options;

  // Si le post est sensible ou dans une catégorie sensible
  // → utiliser l'alias
  if (isSensitive || isThreadCategorySensitive(threadCategory)) {
    return aliasName || "Anonyme";
  }

  // Sinon, utiliser le displayUsername si disponible, sinon fallback à l'alias
  return displayUsername || aliasName || "Utilisateur";
}
