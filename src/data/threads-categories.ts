export type ThreadCategory =
	| "VIOLENCE"
	| "ABUS"
	| "TEMOIN"
	| "DETRESSE"
	| "AUTRE";

export interface CategoryConfig {
	id: ThreadCategory;
	label: string;
	description: string;
	icon: string;
	color: string; // Tailwind color class
	helpText?: string;
}

export const threadCategories: CategoryConfig[] = [
	{
		id: "VIOLENCE",
		label: "Violence",
		description:
			"Partager une expérience de violence physique ou psychologique",
		icon: "🛡️",
		color: "border-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
		helpText:
			"Vous êtes en sécurité ici. Prenez le temps dont vous avez besoin.",
	},
	{
		id: "ABUS",
		label: "Abus",
		description: "Témoigner d'une situation d'abus ou de manipulation",
		icon: "💔",
		color: "border-violet-500 bg-violet-500/10 hover:bg-violet-500/20",
		helpText: "Votre expérience est valide. Nous vous écoutons sans jugement.",
	},
	{
		id: "TEMOIN",
		label: "Témoin",
		description: "Demander conseil pour aider quelqu'un en difficulté",
		icon: "👁️",
		color: "border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20",
		helpText:
			"Votre vigilance peut faire la différence. Partagez vos préoccupations.",
	},
	{
		id: "DETRESSE",
		label: "Détresse",
		description: "Exprimer un besoin urgent de soutien émotionnel",
		icon: "🆘",
		color: "border-amber-500 bg-amber-500/10 hover:bg-amber-500/20",
		helpText: "Vous n'êtes pas seul(e). Exprimez ce que vous ressentez.",
	},
	{
		id: "AUTRE",
		label: "Autre situation",
		description:
			"Partager une expérience qui ne correspond pas aux autres catégories",
		icon: "💬",
		color: "border-slate-400 bg-slate-400/10 hover:bg-slate-400/20",
		helpText: "Chaque histoire compte. Partagez la vôtre.",
	},
];

export function getCategoryConfig(
	categoryId: ThreadCategory,
): CategoryConfig | undefined {
	return threadCategories.find((cat) => cat.id === categoryId);
}
