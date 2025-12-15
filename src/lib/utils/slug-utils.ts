import slugify from "slugify";

/**
 * Génère un slug URL-safe à partir d'un titre
 * @param title - Le titre à convertir en slug
 * @returns Un slug nettoyé et formaté
 */
export function createSlugFromTitle(title: string): string {
  const baseSlug = slugify(title, {
    lower: true,      // Tout en minuscules
    strict: true,     // Supprime les caractères spéciaux
    trim: true,       // Enlève les espaces en début/fin
    locale: "fr",     // Support du français (accents)
  });

  // Fallback si le titre ne produit aucun caractère valide
  return baseSlug || "thread";
}

/**
 * Génère un slug unique en ajoutant un suffixe aléatoire
 * pour éviter les collisions avec la contrainte UNIQUE en base
 * @param title - Le titre à convertir en slug
 * @returns Un slug unique avec suffixe
 *
 * @example
 * generateUniqueSlug("Mon Super Thread !")
 * // => "mon-super-thread-a3x9k2"
 */
export function generateUniqueSlug(title: string): string {
  const baseSlug = createSlugFromTitle(title);

  // Ajoute un suffixe court (6 caractères alphanumériques)
  // Probabilité de collision extrêmement faible (~2 milliards de combinaisons)
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${baseSlug}-${suffix}`;
}
