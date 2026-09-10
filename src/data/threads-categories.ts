export const threadCategoryIds = [
	"VIOLENCE",
	"ABUS",
	"TEMOIN",
	"DETRESSE",
	"AUTRE",
] as const;

export type ThreadCategory = (typeof threadCategoryIds)[number];

export function parseThreadCategory(
	value: unknown,
): ThreadCategory | undefined {
	if (typeof value !== "string") return undefined;

	const normalizedValue = value.toUpperCase();
	return threadCategoryIds.find((category) => category === normalizedValue);
}

export interface CategoryConfig {
	id: ThreadCategory;
	label: string;
	description: string;
	icon: string;
	color: string; // Tailwind color class
	helpText: string;
	titlePlaceholder: string;
	bodyPlaceholder: string;
	guidingQuestions: string[];
}

export const threadCategories: CategoryConfig[] = [
	{
		id: "VIOLENCE",
		label: "Violence",
		description:
			"Tester le dépôt d’un scénario fictif de violence physique ou psychologique",
		icon: "🛡️",
		color: "border-primary bg-primary/10 hover:bg-primary/20",
		helpText:
			"Pour cette bêta, décrivez une situation fictive sans nom réel ni détail identifiant.",
		titlePlaceholder: "Ex. Une personne subit des menaces répétées",
		bodyPlaceholder:
			"Décrivez la situation fictive sans nom réel ni détail identifiant…",
		guidingQuestions: [
			"Que se passe-t-il dans ce scénario ?",
			"Comment le personnage pourrait-il décrire la situation ?",
			"Quelle information devrait être comprise par le modérateur ?",
		],
	},
	{
		id: "ABUS",
		label: "Abus",
		description: "Tester un scénario fictif d’abus ou de manipulation",
		icon: "💔",
		color: "border-chart-2 bg-chart-2/10 hover:bg-chart-2/20",
		helpText:
			"Utilisez une situation inventée pour tester le dépôt. Le modérateur examinera le message.",
		titlePlaceholder: "Ex. Une relation fictive devient contrôlante",
		bodyPlaceholder: "Décrivez la situation inventée et son contexte…",
		guidingQuestions: [
			"Quelle forme prend la manipulation dans ce scénario ?",
			"Depuis combien de temps la situation fictive dure-t-elle ?",
			"Quelle étape le personnage a-t-il déjà envisagée ?",
		],
	},
	{
		id: "TEMOIN",
		label: "Témoin",
		description: "Tester le récit fictif d’une personne témoin d’une situation",
		icon: "👁️",
		color: "border-accent bg-accent/10 hover:bg-accent/20",
		helpText:
			"Imaginez une situation sans personne réelle, puis décrivez ce que le témoin observerait.",
		titlePlaceholder: "Ex. Un témoin fictif remarque un changement",
		bodyPlaceholder: "Décrivez ce que le personnage aurait observé…",
		guidingQuestions: [
			"Quelle relation imaginaire relie les deux personnages ?",
			"Quels changements le témoin fictif aurait-il observés ?",
			"Quelle information souhaite-t-il transmettre ?",
		],
	},
	{
		id: "DETRESSE",
		label: "Détresse",
		description: "Tester un scénario de détresse émotionnelle",
		icon: "🆘",
		color: "border-warning bg-warning/10 hover:bg-warning/20",
		helpText:
			"Ce test ne fournit pas de soutien immédiat. Utilisez un scénario fictif et consultez Aide si nécessaire.",
		titlePlaceholder: "Ex. Scénario fictif de détresse",
		bodyPlaceholder: "Décrivez les émotions du personnage fictif…",
		guidingQuestions: [
			"Comment le personnage se sent-il dans ce scénario ?",
			"Quel événement fictif l’a conduit à cette situation ?",
			"Quelle information est importante pour comprendre le récit ?",
		],
	},
	{
		id: "AUTRE",
		label: "Autre situation",
		description:
			"Tester un autre scénario fictif qui ne correspond pas aux catégories",
		icon: "💬",
		color: "border-muted bg-muted/10 hover:bg-muted/20",
		helpText:
			"Inventez une situation sans personne réelle ni détail permettant d’identifier quelqu’un.",
		titlePlaceholder: "Ex. Une autre situation fictive",
		bodyPlaceholder: "Décrivez le scénario inventé…",
		guidingQuestions: [
			"Quel est le sujet du scénario ?",
			"Quelle information doit être comprise à la lecture ?",
		],
	},
];

export function getCategoryConfig(
	categoryId: ThreadCategory,
): CategoryConfig | undefined {
	return threadCategories.find((cat) => cat.id === categoryId);
}
