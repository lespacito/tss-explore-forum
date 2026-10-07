import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { SafetyNotice } from "@/features/beta/components/safety-notice";

export default function FeaturesSection() {
	const { accessRequired, submissionsOpen } = useBetaPresentation();
	const privacyId = useId();
	const contributionId = useId();
	const helpId = useId();
	return (
		<>
			<section className="landing-trust" aria-labelledby={privacyId}>
				<div className="landing-section-layout">
					<header>
						<h2 id={privacyId}>Ce qui est public, ce qui reste interne</h2>
						<Link to="/privacy" className="landing-text-link">
							Comprendre la confidentialité <ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<div className="landing-trust-copy">
						<p>
							Si votre situation est publiée, elle porte la mention
							<strong> « Auteur anonyme »</strong>. Le pseudonyme reste interne
							: il n’est pas affiché comme nom d’auteur dans le fil.
						</p>
						<p>
							Selon le parcours de compte utilisé, une adresse e-mail peut être
							demandée. Les informations du compte ne sont pas affichées comme
							signature de la publication.
						</p>
						<p className="landing-privacy-limit">
							Cela ne garantit pas un anonymat absolu. Le contenu et certaines
							données techniques peuvent permettre de vous reconnaître.
							L’administration technique peut relier votre session à ses
							pseudonymes internes.
						</p>
					</div>
				</div>
			</section>
			{/* biome-ignore lint/correctness/useUniqueElementIds: Stable landing navigation target. */}
			<section
				className="landing-contribution"
				id="comment-ca-marche"
				aria-labelledby={contributionId}
			>
				<div className="landing-section-layout">
					<header>
						<h2 id={contributionId}>Contribuer, à votre rythme</h2>
						<p>
							{!accessRequired && !submissionsOpen
								? "La lecture reste accessible à tous les adultes. Les contributions sont temporairement suspendues ; voici le parcours lorsqu’elles sont ouvertes."
								: "Consulter ne vous oblige pas à écrire. Si vous participez au test, voici le parcours."}
						</p>
						<Link to="/rules" className="landing-text-link">
							{accessRequired
								? "Lire les règles de la bêta"
								: "Lire les règles"}{" "}
							<ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<ol className="landing-steps">
						<li>
							<h3>
								{accessRequired
									? "Rédiger la situation fournie"
									: "Rédiger une situation fictive"}
							</h3>
							<p>
								{accessRequired
									? "Utilisez uniquement la situation fictive fournie avec votre invitation, sans récit personnel ni détail identifiant."
									: "Utilisez uniquement une situation fictive, sans récit personnel ni détail identifiant."}
							</p>
						</li>
						<li>
							<h3>Envoyer pour examen</h3>
							<p>
								Un examen humain précède toute publication. L’envoi ne rend pas
								la situation immédiatement visible.
							</p>
						</li>
						<li>
							<h3>Retrouver la décision</h3>
							<p>
								Dans Mes situations fictives, suivez le statut : À examiner,
								Publiée ou Non publiée. Un motif accompagne une non-publication.
							</p>
						</li>
					</ol>
				</div>
			</section>
			<section className="landing-help" aria-labelledby={helpId}>
				<div className="landing-section-layout">
					<header>
						<h2 id={helpId}>
							Pour une situation réelle, trouver une aide adaptée
						</h2>
						<p>
							{accessRequired
								? "Des ressources extérieures à la bêta sont accessibles sans invitation."
								: "Des ressources extérieures sont accessibles pour une situation réelle."}
						</p>
						<Link to="/help" className="landing-text-link">
							Consulter les ressources d’aide{" "}
							<ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<SafetyNotice />
				</div>
			</section>
		</>
	);
}
