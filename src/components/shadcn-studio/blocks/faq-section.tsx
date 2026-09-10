import { ChevronDown } from "lucide-react";

const faqs = [
	{
		q: "Qui peut lire mes publications ?",
		a: "Seules les personnes invitées peuvent consulter cette bêta. Le modérateur relit chaque publication avant sa mise en ligne. Utilisez uniquement des scénarios fictifs pendant cette première cohorte.",
	},
	{
		q: "Que protège mon alias ?",
		a: "Votre alias remplace votre identité dans les publications. Il ne rend pas un récit impossible à reconnaître : évitez les noms, lieux précis et autres détails identifiants. Consultez la page Confidentialité pour les limites de cette protection.",
	},
	{
		q: "Quand mon message sera-t-il examiné ?",
		a: "Les créneaux de modération sont communiqués avec votre invitation. La modération n’est pas permanente. Retrouvez la décision et, en cas de refus, son motif dans Mes publications.",
	},
	{
		q: "Comment retrouver ou effacer ma session ?",
		a: "Conservez votre code secret dans un endroit privé. Il permet de retrouver votre session et vos publications. L’effacement est accessible depuis Gérer le compte. Ne partagez ni ce code ni votre code d’invitation.",
	},
];
export default function FaqSection() {
	return (
		<section className="mx-auto max-w-xl py-12" aria-labelledby="faq-heading">
			<h2 id="faq-heading" className="mb-6 font-serif text-2xl font-semibold">
				Questions sur la bêta
			</h2>
			<div className="divide-y border-y">
				{faqs.map((f) => (
					<details key={f.q} className="group py-2">
						<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium">
							{f.q}
							<ChevronDown
								className="size-5 shrink-0 group-open:rotate-180"
								aria-hidden="true"
							/>
						</summary>
						<p className="max-w-prose pb-4 leading-7 text-muted-foreground">
							{f.a}
						</p>
					</details>
				))}
			</div>
		</section>
	);
}
