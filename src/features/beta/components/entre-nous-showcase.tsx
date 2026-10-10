import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, CirclePause } from "lucide-react";
import { useId } from "react";
import { useBetaPresentation } from "./beta-presentation";
import { SafetyNotice } from "./safety-notice";

const questions = [
	{
		q: "Est-ce que je peux raconter ce que je vis ici ?",
		a: "Non. Cette démonstration n’accepte aucune contribution. N’envoyez pas de récit personnel ni de détail permettant de reconnaître quelqu’un, même dans un retour sur le site.",
	},
	{
		q: "Les réponses entre pairs sont-elles disponibles ?",
		a: "Non. Elles sont prévues, avec une relecture humaine avant publication. Aucune réponse ni aucun délai ne seraient garantis. Entre nous ne remplacerait ni un service d’urgence ni un avis professionnel, juridique ou médical. Il n’y aurait pas de permanence 24 h/24.",
	},
	{
		q: "Sans email signifie-t-il un anonymat absolu ?",
		a: "Non. Le parcours sous alias ne demande ni nom réel ni email. Le fil affiche « Auteur anonyme » ; votre alias reste interne. L’administration technique peut relier votre session à ses alias. Un récit ou des données techniques peuvent permettre de vous reconnaître : l’alias ne garantit pas un anonymat absolu.",
	},
	{
		q: "Que montrent les scénarios ?",
		a: "Ce sont des récits inventés, sans personne réelle ni détail identifiant. Ils montrent comment mettre une situation en mots. Ce ne sont pas des témoignages de participants.",
	},
	{
		q: "Comment garder la main sur mon texte ?",
		a: "Dans le parcours de test existant, un code de récupération permet de retrouver votre session : gardez-le confidentiel. Mes scénarios permet de suivre votre texte et d’effacer vos données. Les statuts sont À examiner, Publié ou Non publié, avec un motif en cas de non-publication. Ce parcours ne rouvre pas les contributions dans cette vitrine.",
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
						<p className="showcase-status">
							Démonstration fictive · Contributions fermées
						</p>
						<h1 id={titleId}>
							Pas assez grave pour appeler ? Assez pour en parler.
						</h1>
						<p className="landing-mission">
							<strong>Entre nous, sur Parlons Violence.</strong> Un futur espace
							pour parler de harcèlement, de violences ou d’une situation
							difficile. Pour les adultes en Suisse romande et leurs proches.
						</p>
						<p className="showcase-future">
							À terme : écrire sous alias, sans nom réel ni adresse email. Des
							réponses entre pairs, relues par une personne avant publication,
							sont prévues.
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
							Indisponible en préproduction : aucun envoi possible. Les réponses
							et commentaires sont fermés. N’envoyez pas de récit personnel.
						</p>
						<p className="landing-contribution-note">
							Un alias ne garantit pas un anonymat absolu.
						</p>
						<p className="showcase-urgent">
							Danger imminent en Suisse : <a href="tel:117">117 — police</a>
							{" ou "}
							<a href="tel:144">144 — urgence médicale</a>.
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
							« J’ai demandé à un proche d’arrêter les remarques sur mon
							apparence. Il continue et dit que c’est pour rire. Est-ce que j’ai
							le droit de poser cette limite ? »
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
							Ce parcours est en préparation, pas encore ouvert. Aujourd’hui,
							seuls des scénarios inventés illustrent le projet.
						</p>
						<Link to="/rules" className="landing-text-link">
							Lire les règles de la démonstration{" "}
							<ArrowUpRight aria-hidden="true" />
						</Link>
					</header>
					<ol className="landing-steps">
						<li>
							<h3>Écrire à votre rythme</h3>
							<p>
								Vous pourriez raconter ce qui se passe, pour vous ou un proche,
								sous alias. Aucun nom réel ni email ne serait demandé.
							</p>
						</li>
						<li>
							<h3>Une relecture humaine avant publication</h3>
							<p>
								Chaque texte serait relu par une personne avant d’apparaître
								dans l’espace : c’est la prémodération prévue.
							</p>
						</li>
						<li>
							<h3>Échanger entre pairs</h3>
							<p>
								Des réponses d’autres adultes sont prévues, avec la même
								relecture. Elles ne sont pas encore disponibles. Aucune réponse
								ni aucun délai ne seraient garantis.
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
