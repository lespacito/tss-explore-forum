import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";

export default function HeroSection() {
	const { accessRequired, submissionsOpen } = useBetaPresentation();
	const titleId = useId();
	const exampleId = useId();
	return (
		<section className="landing-hero" aria-labelledby={titleId}>
			<div className="landing-sheet">
				<div className="landing-intro">
					<h1 id={titleId}>Mieux comprendre les situations de violence.</h1>
					<p className="landing-mission">
						Parlons Violence explore une façon d’aborder ces situations à partir
						de récits fictifs.{" "}
						{accessRequired || submissionsOpen
							? "Découvrez le parcours et contribuez à son amélioration."
							: "Découvrez les situations fictives publiées."}
					</p>
					<p className="landing-beta-label">
						{accessRequired
							? "Bêta privée pour adultes invités · Situations fictives uniquement"
							: "Accès public pour adultes · Situations fictives uniquement"}
					</p>
					<div className="landing-actions">
						<Link to="/threads" className="landing-cta">
							Consulter les situations fictives
							<ArrowRight aria-hidden="true" />
						</Link>
						<AnonymousPostButton
							className="landing-secondary-action"
							label="Proposer une situation fictive"
						/>
					</div>
					<p className="landing-contribution-note">
						{accessRequired
							? "Pour contribuer, utilisez uniquement la situation fictive fournie avec votre invitation. Environ 10 minutes."
							: submissionsOpen
								? "Pour contribuer, rédigez uniquement une situation fictive, sans récit personnel ni détail identifiant. Environ 10 minutes."
								: "Le site est accessible publiquement en lecture. Les contributions sont temporairement suspendues."}
					</p>
					<Link to="/help" className="landing-text-link">
						Trouver une aide adaptée <ArrowUpRight aria-hidden="true" />
					</Link>
				</div>
				<figure className="landing-example" aria-labelledby={exampleId}>
					<figcaption id={exampleId}>
						Exemple fictif — illustration, pas une publication
					</figcaption>
					<h2>Quand une limite n’est pas respectée</h2>
					<blockquote>
						Une personne demande à un proche d’arrêter les remarques sur son
						apparence. Le proche continue, en disant que c’est pour rire.
					</blockquote>
					<p className="landing-example-note">
						Un récit court pour décrire ce qui se passe, sans nom ni détail
						identifiant.
					</p>
				</figure>
			</div>
		</section>
	);
}
