const adjectives = [
  "Lumineux",
  "Serein",
  "Mystique",
  "Étincelant",
  "Paisible",
  "Radieux",
  "Silencieux",
  "Brillant",
  "Doux",
  "Clair",
  "Apaisant",
  "Subtil",
  "Gracieux",
  "Tranquille",
  "Magnifique",
  "Élégant",
  "Délicat",
  "Harmonieux",
  "Cristallin",
  "Argenté",
  "Doré",
  "Nocturne",
  "Matinal",
  "Céleste",
  "Divin",
  "Enchanté",
  "Féerique",
  "Merveilleux",
  "Sublime",
  "Pur",
];

const nouns = [
  "Aurore",
  "Lune",
  "Étoile",
  "Nuage",
  "Vent",
  "Rivière",
  "Forêt",
  "Colline",
  "Horizon",
  "Crépuscule",
  "Brume",
  "Cascade",
  "Océan",
  "Montagne",
  "Vallée",
  "Prairie",
  "Jardin",
  "Lac",
  "Flamme",
  "Rosée",
  "Neige",
  "Pluie",
  "Arc-en-ciel",
  "Papillon",
  "Oiseau",
  "Cerf",
  "Renard",
  "Hibou",
  "Lys",
  "Rose",
];

/**
 * Génère un alias aléatoire au format "Adjectif-Nom-Nombre"
 *
 * @returns Un alias unique de type "Lumineux-Aurore-1234"
 *
 * @example
 * ```typescript
 * const alias = generateAlias();
 * // => "Serein-Crépuscule-7892"
 * ```
 */
export function generateAlias(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999);

  return `${adjective}-${noun}-${number.toString().padStart(4, "0")}`;
}
