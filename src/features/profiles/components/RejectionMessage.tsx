import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

interface RejectionMessageProps {
	reason: string;
}

export function RejectionMessage({ reason }: RejectionMessageProps) {
	const needsSupportOrientation =
		reason.includes("situation réelle ou urgente") ||
		reason.includes("permettre d’identifier une personne");

	return (
		<div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
			<div className="flex gap-3">
				<AlertCircle
					className="h-5 w-5 text-warning-foreground dark:text-warning mt-0.5 flex-shrink-0"
					aria-hidden="true"
				/>
				<div className="space-y-2">
					<h4 className="font-semibold text-warning-foreground dark:text-warning">
						Pourquoi ce scénario n’a pas été publié
					</h4>
					<p className="text-sm text-foreground/80">{reason}</p>
					<p className="text-sm text-muted-foreground">
						Vous pouvez créer un nouveau scénario fictif en tenant compte de ce
						motif.
					</p>
					{needsSupportOrientation && (
						<p className="text-sm text-muted-foreground">
							Cette bêta ne traite pas les demandes réelles ou urgentes.
							Consultez{" "}
							<Link
								to="/help"
								className="font-medium underline underline-offset-4"
							>
								les ressources d’aide
							</Link>
							.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
