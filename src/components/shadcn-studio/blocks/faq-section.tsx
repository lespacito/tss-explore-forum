import { ChevronDown } from "lucide-react";
import { useId } from "react";

const faqs = [
	{
		q: "Qui peut lire mes situations fictives ?",
		a: "Seules les personnes invitées peuvent consulter cette bêta. Chaque situation fictive est examinée par la modération ; elle devient visible uniquement si sa publication est validée. Aucun récit personnel n’est demandé.",
	},
	{
		q: "Que protège mon pseudonyme ?",
		a: "Le pseudonyme est affiché si votre situation fictive est publiée. Il ne garantit pas un anonymat absolu. L’administration technique peut relier votre session à ses pseudonymes ; le contenu peut aussi permettre de vous reconnaître. Évitez les noms, lieux précis et autres détails identifiants.",
	},
	{
		q: "À quoi servent les deux codes ?",
		a: "Le code d’invitation ouvre l’accès à la bêta. Le code de récupération permet de retrouver votre session et ne doit jamais être partagé ni placé dans une URL.",
	},
	{
		q: "Comment connaître la décision ?",
		a: "La modération n’est pas permanente et ne constitue pas une aide professionnelle. Le statut — À examiner, Publiée ou Non publiée — apparaît dans Mes situations fictives, avec un motif en cas de non-publication.",
	},
];

export default function FaqSection() {
	const titleId = useId();
	return (
		// biome-ignore lint/correctness/useUniqueElementIds: This route section owns a stable hash target.
		<section className="landing-faq" id="questions" aria-labelledby={titleId}>
			<header>
				<h2 id={titleId}>
					Avant d’entrer
					<br />
					dans la bêta.
				</h2>
				<p>
					Quatre réponses utiles à lire sur un appareil personnel ou partagé.
				</p>
			</header>
			<div className="landing-faq-list">
				{faqs.map((item, index) => (
					<details key={item.q} name="landing-faq">
						<summary>
							<span aria-hidden="true">
								{String(index + 1).padStart(2, "0")}
							</span>
							<strong>{item.q}</strong>
							<ChevronDown aria-hidden="true" />
						</summary>
						<p>{item.a}</p>
					</details>
				))}
			</div>
		</section>
	);
}
