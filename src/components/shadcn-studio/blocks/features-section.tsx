import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { SafetyNotice } from "@/features/beta/components/safety-notice";

export default function FeaturesSection() {
	const { accessRequired, submissionsOpen, publicationMode } =
		useBetaPresentation();
	const real = publicationMode === "real";
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
							{real
								? "Si votre témoignage est publié, il porte la mention"
								: "Si votre situation est publiée, elle porte la mention"}
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
							{real
								? submissionsOpen
									? "Consulter ne vous oblige pas à écrire. Vous choisissez ce que vous souhaitez partager."
									: "Les contributions sont temporairement suspendues. Vous pouvez continuer à lire les témoignages déjà publiés."
								: !accessRequired && !submissionsOpen
									? "La lecture reste accessible à tous les adultes. Les contributions sont temporairement suspendues ; voici le parcours lorsqu’elles sont ouvertes."
									: "Consulter ne vous oblige pas à écrire. Si vous participez au test, voici le parcours."}
						</p>
						<Link to="/rules" className="landing-text-link">
							{accessRequired && !real
								? "Lire les règles de la bêta"
								: "Lire les règles"}{" "}
							<ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<ol className="landing-steps">
						<li>
							<h3>
								{real
									? "Rédiger à votre rythme"
									: accessRequired
										? "Rédiger la situation fournie"
										: "Rédiger une situation fictive"}
							</h3>
							<p>
								{real
									? "Vous pouvez parler d’une expérience vécue ou dont vous avez été témoin. Évitez les noms, coordonnées et détails permettant d’identifier une autre personne."
									: accessRequired
										? "Utilisez uniquement la situation fictive fournie avec votre invitation, sans récit personnel ni détail identifiant."
										: "Utilisez uniquement une situation fictive, sans récit personnel ni détail identifiant."}
							</p>
						</li>
						<li>
							<h3>Envoyer pour examen</h3>
							<p>
								Un examen humain précède toute publication. L’envoi ne rend pas{" "}
								{real ? "le témoignage" : "la situation"} immédiatement visible.
							</p>
						</li>
						<li>
							<h3>Retrouver la décision</h3>
							<p>
								Dans {real ? "Mes témoignages" : "Mes situations fictives"},
								suivez le statut :{" "}
								{real
									? "À examiner, Publié ou Non publié"
									: "À examiner, Publiée ou Non publiée"}
								. Un motif accompagne une non-publication.
							</p>
						</li>
					</ol>
				</div>
			</section>
			<section className="landing-help" aria-labelledby={helpId}>
				<div className="landing-section-layout">
					<header>
						<h2 id={helpId}>
							{real
								? "Trouver une aide adaptée"
								: "Pour une situation réelle, trouver une aide adaptée"}
						</h2>
						<p>
							{real
								? "Cet espace ne remplace ni un service d’urgence ni un accompagnement professionnel. Des ressources extérieures peuvent vous orienter."
								: accessRequired
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
