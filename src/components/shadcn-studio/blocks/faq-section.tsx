import { ChevronDown } from "lucide-react";
import { useId } from "react";

const faqs = [
	{
		q: "Peut-on simplement consulter ?",
		a: "Oui. Les personnes invitées peuvent lire les situations fictives publiées sans envoyer de situation. Chaque publication a été examinée par la modération. Les réponses et commentaires restent fermés.",
	},
	{
		q: "Que signifie « Auteur anonyme » ?",
		a: "La publication porte la mention « Auteur anonyme ». Le pseudonyme reste interne et n’est pas affiché comme nom d’auteur ; les informations du compte ne sont pas affichées comme signature. Selon le parcours de compte utilisé, une adresse e-mail peut être demandée. Cela ne garantit pas un anonymat absolu : le contenu et certaines données techniques peuvent permettre de vous reconnaître. L’administration technique peut relier votre session à ses pseudonymes internes.",
	},
	{
		q: "À quoi servent les deux codes ?",
		a: "Le code d’invitation ouvre l’accès à la bêta. Le code de récupération permet de retrouver votre session et ne doit jamais être partagé ni placé dans une URL.",
	},
	{
		q: "Comment connaître la décision ?",
		a: "Le statut — À examiner, Publiée ou Non publiée — apparaît dans Mes situations fictives, avec un motif en cas de non-publication. La modération n’est ni immédiate ni permanente et ne constitue pas une aide professionnelle.",
	},
];

export default function FaqSection() {
	const titleId = useId();
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: Stable landing navigation target.
		<section className="landing-faq" id="questions" aria-labelledby={titleId}>
			<div className="landing-section-layout">
				<header>
					<h2 id={titleId}>Quelques réponses avant de participer</h2>
					<p>
						Vous gardez le choix de consulter, de contribuer au test ou de
						revenir plus tard.
					</p>
				</header>
				<div className="landing-faq-list">
					{faqs.map((item) => (
						<details key={item.q} name="landing-faq">
							<summary>
								<strong>{item.q}</strong>
								<ChevronDown aria-hidden="true" />
							</summary>
							<p>{item.a}</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
