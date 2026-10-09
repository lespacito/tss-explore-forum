import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, CirclePause } from "lucide-react";
import { useId } from "react";
import { useBetaPresentation } from "./beta-presentation";
import { SafetyNotice } from "./safety-notice";

const questions = [
	{
		q: "Est-ce que je peux raconter ce que je vis ici ?",
		a: "Non. Les dépôts sont fermés dans cette démonstration. N’envoyez pas de récit personnel ni de détail permettant de reconnaître une personne, même dans un retour sur le site.",
	},
	{
		q: "Les réponses entre pairs sont-elles disponibles ?",
		a: "Non. Le futur service prévoit des réponses d’autres adultes, relues avant publication. Elles ne sont pas encore disponibles. Aucune réponse ni aucun délai ne seraient garantis. Entre nous ne remplacerait ni un service d’urgence ni un avis professionnel, juridique ou médical, et ne proposerait pas de permanence 24 h/24.",
	},
	{
		q: "Sans email signifie-t-il un anonymat absolu ?",
		a: "Non. La session sous alias ne demande ni nom réel ni email. Votre code de récupération permet de la retrouver : gardez-le confidentiel. Le fil affiche « Auteur anonyme » ; votre alias reste interne. L’administration technique peut relier votre session à ses alias. Un récit ou des données techniques peuvent permettre de vous reconnaître : l’alias ne garantit pas un anonymat absolu.",
	},
	{
		q: "Que montrent les scénarios ?",
		a: "Ce sont des récits inventés, sans personne réelle ni détail identifiant. Ils montrent comment mettre une situation en mots. Ce ne sont pas des témoignages de participants.",
	},
];

export function EntreNousShowcase() {
	const { accessRequired } = useBetaPresentation();
	const titleId = useId();
	const exampleId = useId();
	const offerId = useId();
	const helpId = useId();
	const faqId = useId();
	const unavailableId = useId();
	return (
		<div className="landing-page entre-nous-showcase min-h-screen">
			<section className="landing-hero" aria-labelledby={titleId}>
				<div className="landing-sheet">
					<div className="landing-intro">
						<h1 id={titleId}>
							Pas assez grave pour appeler ? Assez pour en parler.
						</h1>
						<p className="landing-mission">
							<strong>Entre nous, sur Parlons Violence.</strong> Un futur espace
							pour mettre des mots sur ce que vous vivez, dans le couple, au
							travail ou en famille. Pour les adultes en Suisse romande et les
							proches inquiets.
						</p>
						<p className="landing-beta-label">
							Vitrine de l’offre future · Préproduction · Scénarios
							exclusivement fictifs
						</p>
						<div className="landing-actions">
							<button
								type="button"
								className="landing-cta"
								disabled
								aria-describedby={unavailableId}
							>
								En parler, entre nous <CirclePause aria-hidden="true" />
							</button>
						</div>
						<p id={unavailableId} className="landing-contribution-note">
							Indisponible en préproduction. Les dépôts, réponses et
							commentaires sont fermés. N’envoyez pas de récit personnel.
						</p>
						<p className="landing-contribution-note">
							Pour le futur service : sans email, avec relecture avant
							publication.
						</p>
						<Link to="/help" className="landing-text-link">
							Trouver une aide adaptée <ArrowUpRight aria-hidden="true" />
						</Link>
					</div>
					<figure className="landing-example" aria-labelledby={exampleId}>
						<figcaption id={exampleId}>
							Scénario fictif — illustration, pas une publication
						</figcaption>
						<h2>Quand une limite n’est pas respectée</h2>
						<blockquote>
							Une personne demande à un proche d’arrêter les remarques sur son
							apparence. Le proche continue, en disant que c’est pour rire.
						</blockquote>
						<p className="landing-example-note">
							Ce récit est inventé. Il ne décrit aucune personne réelle.
						</p>
						<Link to="/threads" className="landing-text-link">
							Lire les scénarios fictifs <ArrowUpRight aria-hidden="true" />
						</Link>
						<p className="landing-example-note">
							{accessRequired
								? "Une invitation valide est nécessaire pour lire le fil de démonstration."
								: "Le fil de démonstration se lit sans invitation."}
						</p>
					</figure>
				</div>
			</section>
			{/* biome-ignore lint/correctness/useUniqueElementIds: Existing landing navigation target. */}
			<section
				className="landing-contribution"
				id="comment-ca-marche"
				aria-labelledby={offerId}
			>
				<div className="landing-section-layout">
					<header>
						<h2 id={offerId}>Ce que l’offre future prévoit</h2>
						<p>
							Cette offre est en préparation. Pour le moment, vous pouvez
							découvrir le projet à partir de scénarios fictifs.
						</p>
						<Link to="/rules" className="landing-text-link">
							Lire les règles de la démonstration{" "}
							<ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<ol className="landing-steps">
						<li>
							<h3>Mettre des mots, sans nom ni email</h3>
							<p>
								Vous pourriez décrire ce qui se passe, avec des questions pour
								vous guider, sous alias et sans email. Vous pourriez aussi
								écrire en tant que proche. Un récit peut néanmoins permettre de
								vous reconnaître.
							</p>
						</li>
						<li>
							<h3>Lire et recevoir un regard extérieur</h3>
							<p>
								Le futur service prévoit des réponses d’autres adultes, relues
								avant publication. Elles ne sont pas encore disponibles. Aucune
								réponse ni aucun délai ne seraient garantis.
							</p>
						</li>
						<li>
							<h3>Garder la main</h3>
							<p>
								Le parcours de test permet déjà de retrouver votre session avec
								un code de récupération, de suivre votre texte dans Mes
								scénarios et d’effacer vos données. Les statuts sont À examiner,
								Publié ou Non publié, avec un motif en cas de non-publication.
							</p>
						</li>
					</ol>
				</div>
			</section>
			<section className="landing-help" aria-labelledby={helpId}>
				<div className="landing-section-layout">
					<header>
						<h2 id={helpId}>Besoin d’aide aujourd’hui ?</h2>
						<p>
							Les services ci-dessous peuvent vous orienter pour une situation
							réelle. Ils sont accessibles sans invitation.
						</p>
						<Link to="/help" className="landing-text-link">
							Consulter les ressources d’aide{" "}
							<ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<SafetyNotice />
				</div>
			</section>
			{/* biome-ignore lint/correctness/useUniqueElementIds: Existing landing navigation target. */}
			<section className="landing-faq" id="questions" aria-labelledby={faqId}>
				<div className="landing-section-layout">
					<header>
						<h2 id={faqId}>Comprendre cette vitrine</h2>
						<Link to="/privacy" className="landing-text-link">
							Comprendre la confidentialité <ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<div className="landing-faq-list">
						{questions.map(({ q, a }) => (
							<details key={q} name="landing-faq">
								<summary>
									<strong>{q}</strong>
									<ChevronDown aria-hidden="true" />
								</summary>
								<p>{a}</p>
							</details>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
