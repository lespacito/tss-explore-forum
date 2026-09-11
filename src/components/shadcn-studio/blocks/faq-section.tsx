import { ChevronDown } from "lucide-react";
import { useId } from "react";

const faqs = [
	{
		q: "Qui peut lire mes publications ?",
		a: "Seules les personnes invitées peuvent consulter cette bêta. Chaque publication est relue avant sa mise en ligne. Pour cette cohorte, utilisez uniquement un scénario fictif.",
	},
	{
		q: "Que protège mon alias ?",
		a: "L’alias remplace votre identité dans les publications. Il ne rend pas un récit impossible à reconnaître : évitez les noms, lieux précis et autres détails identifiants.",
	},
	{
		q: "À quoi servent les deux codes ?",
		a: "Le code d’invitation ouvre l’accès à la bêta. Le code secret personnel permet de retrouver votre session et ne doit jamais être partagé ni placé dans une URL.",
	},
	{
		q: "Comment connaître la décision ?",
		a: "La modération n’est pas permanente. Le statut — en attente, publiée ou refusée — apparaît dans Mes publications, avec un motif lorsqu’un dépôt est refusé.",
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
