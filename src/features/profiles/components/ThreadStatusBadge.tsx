import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { ThreadStatus } from "@/db/schemas/thread";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
	pending: {
		label: "À examiner",
		icon: Clock,
		className: "bg-warning/15 border-warning/50 text-warning-foreground",
	},
	published: {
		label: "Publiée",
		icon: CheckCircle,
		className: "bg-primary/10 border-primary/30 text-primary",
	},
	rejected: {
		label: "Non publiée",
		icon: AlertCircle,
		className:
			"bg-warning/10 border-warning/30 text-warning-foreground dark:text-warning",
	},
} as const;

interface ThreadStatusBadgeProps {
	status: ThreadStatus;
	className?: string;
}

export function ThreadStatusBadge({
	status,
	className,
}: ThreadStatusBadgeProps) {
	const real = useBetaPresentation().publicationMode === "real";
	const config = STATUS_CONFIG[status];
	const label =
		real && status !== "pending"
			? status === "published"
				? "Publié"
				: "Non publié"
			: config.label;
	const Icon = config.icon;

	return (
		<>
			{/* biome-ignore lint/a11y/useSemanticElements: This is a visual badge with a live status role, not a form output. */}
			<div
				className={cn(
					"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium",
					config.className,
					className,
				)}
				role="status"
				aria-label={`Statut: ${label}`}
			>
				<Icon className="h-3.5 w-3.5" aria-hidden="true" />
				<span>{label}</span>
			</div>
		</>
	);
}
