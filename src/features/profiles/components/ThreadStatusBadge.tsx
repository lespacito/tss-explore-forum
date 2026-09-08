import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { ThreadStatus } from "@/db/schemas/thread";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
	pending: {
		label: "En attente",
		icon: Clock,
		className: "bg-muted border-border text-muted-foreground",
	},
	published: {
		label: "Publié",
		icon: CheckCircle,
		className: "bg-primary/10 border-primary/30 text-primary",
	},
	rejected: {
		label: "Modifications nécessaires",
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
	const config = STATUS_CONFIG[status];
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
				aria-label={`Statut: ${config.label}`}
			>
				<Icon className="h-3.5 w-3.5" aria-hidden="true" />
				<span>{config.label}</span>
			</div>
		</>
	);
}
