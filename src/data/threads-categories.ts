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
    color: "border-destructive bg-destructive/10 hover:bg-destructive/20",
    helpText:
      "Vous êtes en sécurité ici. Prenez le temps dont vous avez besoin.",
  },
  {
    id: "ABUS",
    label: "Abus",
    description: "Témoigner d'une situation d'abus ou de manipulation",
    icon: "💔",
    color: "border-primary bg-primary/10 hover:bg-primary/20",
    helpText: "Votre expérience est valide. Nous vous écoutons sans jugement.",
  },
  {
    id: "TEMOIN",
    label: "Témoin",
    description: "Demander conseil pour aider quelqu'un en difficulté",
    icon: "👁️",
    color: "border-accent bg-accent/10 hover:bg-accent/20",
    helpText:
      "Votre vigilance peut faire la différence. Partagez vos préoccupations.",
  },
  {
    id: "DETRESSE",
    label: "Détresse",
    description: "Exprimer un besoin urgent de soutien émotionnel",
    icon: "🆘",
    color: "border-secondary bg-secondary/10 hover:bg-secondary/20",
    helpText: "Vous n'êtes pas seul(e). Exprimez ce que vous ressentez.",
  },
  {
    id: "AUTRE",
    label: "Autre situation",
    description:
      "Partager une expérience qui ne correspond pas aux autres catégories",
    icon: "💬",
    color: "border-muted bg-muted/10 hover:bg-muted/20",
    helpText: "Chaque histoire compte. Partagez la vôtre.",
  },
];

export function getCategoryConfig(
  categoryId: ThreadCategory,
): CategoryConfig | undefined {
  return threadCategories.find((cat) => cat.id === categoryId);
}
