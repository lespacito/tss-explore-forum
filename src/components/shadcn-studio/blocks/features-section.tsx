import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Minus } from "lucide-react";
import { useId } from "react";

const commitments = [
	"Accès réservé aux personnes invitées",
	"Publication sous alias après examen humain",
	"Statut et motif de refus visibles dans Mes publications",
	"Effacement accessible depuis Gérer le compte",
];

const limits = [
	"L’alias ne garantit pas un anonymat absolu",
	"La modération n’est ni immédiate ni permanente",
	"Les réponses et commentaires restent fermés",
	"Cette cohorte utilise uniquement des scénarios fictifs",
];

export default function FeaturesSection() {
	const titleId = useId();
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: This route section owns a stable hash target.
		<section
			className="landing-explainer"
			id="comment-ca-marche"
			aria-labelledby={titleId}
		>
			<header>
				<h2 id={titleId}>
					Ce que la bêta teste,
					<br />
					très concrètement.
				</h2>
				<p>
					Pendant deux semaines, une petite cohorte vérifie qu’il est possible
					d’accomplir tout le parcours sans assistance.
				</p>
				<Link to="/rules" className="landing-text-link">
					Lire les règles de la bêta <ArrowUpRight aria-hidden="true" />
				</Link>
			</header>

			<div className="landing-ledger">
				<div>
					<h3>Les engagements du parcours</h3>
					<ul>
						{commitments.map((item) => (
							<li key={item}>
								<Check aria-hidden="true" />
								{item}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h3>Les limites à connaître</h3>
					<ul>
						{limits.map((item) => (
							<li key={item}>
								<Minus aria-hidden="true" />
								{item}
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
