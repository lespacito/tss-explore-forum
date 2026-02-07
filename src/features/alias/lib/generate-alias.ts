const firstNames = [
	"Alex",
	"Camille",
	"Jules",
	"Léa",
	"Lucas",
	"Emma",
	"Louis",
	"Chloé",
	"Thomas",
	"Sarah",
	"Hugo",
	"Manon",
	"Arthur",
	"Marie",
	"Nathan",
	"Laura",
	"Théo",
	"Lisa",
	"Maxime",
	"Alice",
	"Paul",
	"Clara",
	"Antoine",
	"Zoé",
	"Julien",
	"Léna",
	"Pierre",
	"Nina",
	"Simon",
	"Lou",
	"Gabriel",
	"Jade",
	"Tom",
	"Inès",
	"Raphaël",
	"Lina",
	"Victor",
	"Rose",
	"Adam",
	"Mila",
];

const suffixes = [
	"du-nord",
	"du-sud",
	"de-paris",
	"de-lyon",
	"curieux",
	"calme",
	"discret",
	"sincère",
	"bienveillant",
	"attentif",
	"libre",
	"sage",
	"zen",
	"simple",
	"vrai",
	"unique",
	"tranquille",
	"serein",
	"fidèle",
	"gentil",
	"doux",
	"fort",
	"créatif",
	"courageux",
	"patient",
	"optimiste",
	"joyeux",
	"rêveur",
	"songeur",
	"pensif",
];

/**
 * Génère un alias aléatoire au format "Prénom-suffixe-Nombre"
 *
 * @returns Un alias unique de type "Alex-curieux-1234"
 *
 * @example
 * ```typescript
 * const alias = generateAlias();
 * // => "Jules-serein-7892"
 * ```
 */
export function generateAlias(): string {
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
	const number = Math.floor(Math.random() * 9999);

	return `${firstName}-${suffix}-${number.toString().padStart(4, "0")}`;
}
