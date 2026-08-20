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
			"Partager une expérience de violence physique ou psychologique",
		icon: "🛡️",
		color: "border-primary bg-primary/10 hover:bg-primary/20",
		helpText:
			"Vous êtes en sécurité ici. Votre témoignage restera anonyme et sera traité avec respect.",
		titlePlaceholder: "Ex: J'ai besoin de parler de ce qui m'est arrivé",
		bodyPlaceholder:
			"Prenez le temps dont vous avez besoin. Vous n'êtes pas obligé(e) de tout raconter...",
		guidingQuestions: [
			"Que s'est-il passé ? (optionnel, partagez uniquement ce qui vous semble confortable)",
			"Comment vous sentez-vous maintenant ?",
			"Y a-t-il quelque chose de spécifique avec lequel vous aimeriez de l'aide ?",
		],
	},
	{
		id: "ABUS",
		label: "Abus",
		description: "Témoigner d'une situation d'abus ou de manipulation",
		icon: "💔",
		color: "border-chart-2 bg-chart-2/10 hover:bg-chart-2/20",
		helpText: "Votre expérience est valide. Nous vous écoutons sans jugement.",
		titlePlaceholder: "Ex: Je pense être dans une situation d'abus",
		bodyPlaceholder: "Décrivez votre situation à votre rythme...",
		guidingQuestions: [
			"Quelle est la nature de la situation ?",
			"Depuis combien de temps cela dure-t-il ?",
			"Avez-vous déjà parlé de cette situation à quelqu'un ?",
		],
	},
	{
		id: "TEMOIN",
		label: "Témoin",
		description: "Demander conseil pour aider quelqu'un en difficulté",
		icon: "👁️",
		color: "border-accent bg-accent/10 hover:bg-accent/20",
		helpText:
			"Votre vigilance peut faire la différence. Merci de prendre soin des autres.",
		titlePlaceholder: "Ex: Je m'inquiète pour quelqu'un",
		bodyPlaceholder: "Décrivez ce que vous avez observé...",
		guidingQuestions: [
			"Quelle est votre relation avec la personne concernée ?",
			"Quels changements ou signes avez-vous observés ?",
			"Qu'espérez-vous accomplir en partageant ceci ?",
		],
	},
	{
		id: "DETRESSE",
		label: "Détresse",
		description: "Exprimer un besoin urgent de soutien émotionnel",
		icon: "🆘",
		color: "border-warning bg-warning/10 hover:bg-warning/20",
		helpText: "Vous n'êtes pas seul(e). Nous sommes là pour vous écouter.",
		titlePlaceholder: "Ex: J'ai besoin de soutien émotionnel urgent",
		bodyPlaceholder: "Exprimez ce que vous ressentez...",
		guidingQuestions: [
			"Comment vous sentez-vous en ce moment ?",
			"Qu'est-ce qui vous a amené(e) à chercher du soutien aujourd'hui ?",
			"Y a-t-il quelque chose de spécifique qui pourrait vous aider maintenant ?",
		],
	},
	{
		id: "AUTRE",
		label: "Autre situation",
		description:
			"Partager une expérience qui ne correspond pas aux autres catégories",
		icon: "💬",
		color: "border-muted bg-muted/10 hover:bg-muted/20",
		helpText: "Chaque histoire compte. Prenez le temps de partager la vôtre.",
		titlePlaceholder: "Ex: Une situation que je souhaite partager",
		bodyPlaceholder: "Partagez votre histoire...",
		guidingQuestions: [
			"De quoi souhaitez-vous parler ?",
			"Qu'espérez-vous en partageant cette expérience ?",
		],
	},
];

export function getCategoryConfig(
	categoryId: ThreadCategory,
): CategoryConfig | undefined {
	return threadCategories.find((cat) => cat.id === categoryId);
}
