import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";

interface RejectionMessageProps {
	reason: string;
}

export function RejectionMessage({ reason }: RejectionMessageProps) {
	const real = useBetaPresentation().publicationMode === "real";
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
						{real
							? "Pourquoi ce témoignage n’a pas été publié"
							: "Pourquoi cette situation fictive n’a pas été publiée"}
					</h4>
					<p className="text-sm text-foreground/80">{reason}</p>
					<p className="text-sm text-muted-foreground">
						{real
							? "Vous pouvez rédiger un nouveau témoignage en tenant compte de ce motif, si vous le souhaitez."
							: "Vous pouvez créer une nouvelle situation fictive en tenant compte de ce motif."}
					</p>
					{needsSupportOrientation && (
						<p className="text-sm text-muted-foreground">
							{real
								? "Cet espace ne prend pas en charge les urgences et ne propose pas d’accompagnement professionnel."
								: "Cette bêta ne traite pas les demandes réelles ou urgentes."}
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
