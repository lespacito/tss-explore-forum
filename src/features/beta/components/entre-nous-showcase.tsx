import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { useId } from "react";
import { useBetaPresentation } from "./beta-presentation";
import { SafetyNotice } from "./safety-notice";

const questions = [
	{
		q: "Est-ce que je peux raconter ce que je vis ici ?",
		a: "Pas en préproduction. Cette vitrine présente une offre future : les dépôts sont fermés, et les réponses et commentaires restent fermés. Ne transmettez aucun récit personnel ni détail permettant d’identifier une personne, y compris dans un retour sur le site.",
	},
	{
		q: "Les réponses entre pairs sont-elles disponibles ?",
		a: "Non. L’offre future prévoit des réponses d’autres adultes, relues par une personne avant publication. Cette fonction n’est pas implémentée. Aucune réponse ni aucun délai ne serait garanti ; les pairs ne remplacent pas un avis professionnel, juridique ou médical.",
	},
	{
		q: "Sans email signifie-t-il un anonymat absolu ?",
		a: "Non. Le parcours sous alias ne demande ni nom réel ni email. Un code de récupération confidentiel permet de retrouver la session. Actuellement, le fil affiche « Auteur anonyme » et l’alias reste interne. L’administration technique peut relier la session à ses alias ; le contenu et les données techniques peuvent permettre de reconnaître une personne.",
	},
	{
		q: "Que montrent les scénarios ?",
		a: "Uniquement des récits inventés, sans personne réelle ni détail identifiant. Ils illustrent une façon de mettre une situation en mots, pas des témoignages ni des résultats d’usage. Le parcours de test existant suit les statuts À examiner, Publié et Non publié dans Mes scénarios, avec un motif de non-publication.",
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
		<div className="landing-page min-h-screen">
			<section className="landing-hero" aria-labelledby={titleId}>
				<div className="landing-sheet">
					<div className="landing-intro">
						<h1 id={titleId}>
							Pas assez grave pour appeler ? Assez pour en parler.
						</h1>
						<p className="landing-mission">
							<strong>Entre nous, sur Parlons Violence.</strong> Un futur espace
							à l’écrit pour les adultes en Suisse romande qui se questionnent
							sur ce qu’ils vivent, dans le couple, au travail ou en famille, et
							pour les proches inquiets.
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
								En parler, entre nous <ArrowRight aria-hidden="true" />
							</button>
						</div>
						<p id={unavailableId} className="landing-contribution-note">
							Indisponible en préproduction. Dépôts, réponses et commentaires
							fermés. Ne racontez pas de situation réelle ici.
						</p>
						<p className="landing-contribution-note">
							Offre future : sans email. Rien ne serait visible avant relecture
							humaine.
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
							Un exemple inventé pour montrer comment décrire ce qui se passe.
							Aucune réponse entre pairs n’est disponible.
						</p>
						<Link to="/threads" className="landing-text-link">
							Lire les scénarios fictifs <ArrowUpRight aria-hidden="true" />
						</Link>
						<p className="landing-example-note">
							{accessRequired
								? "Le fil de démonstration nécessite une invitation valide."
								: "Le fil de démonstration est accessible en lecture sans invitation."}
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
							Une proposition à éprouver sur le terrain. Le service n’est pas
							ouvert aux situations réelles.
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
								L’offre vise une rédaction guidée, sous alias, pour une
								situation vécue ou en tant que proche. Un récit peut permettre
								de reconnaître une personne : l’alias ne garantit pas un
								anonymat absolu.
							</p>
						</li>
						<li>
							<h3>Lire et recevoir un regard extérieur</h3>
							<p>
								Lire des situations proches et échanger avec d’autres adultes.
								Les réponses entre pairs sont prévues, non implémentées. Textes
								et réponses seraient relus avant publication, sans réponse ni
								délai garantis.
							</p>
						</li>
						<li>
							<h3>Garder la main</h3>
							<p>
								Le parcours de test comprend un code de récupération, le suivi
								dans Mes scénarios — À examiner, Publié, Non publié avec motif —
								et l’effacement des données. Leur utilisation avec des
								situations réelles reste à préparer.
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
							Entre nous ne serait ni un service d’urgence, ni une permanence 24
							h/24, ni un accompagnement professionnel. Les ressources d’aide
							sont accessibles dès maintenant, sans invitation.
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
