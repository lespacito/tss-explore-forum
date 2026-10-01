import { Link } from "@tanstack/react-router";
export function SafetyNotice() {
	return (
		<aside className="rounded-xl border border-warning bg-warning/15 p-4 text-sm leading-6">
			<p className="font-semibold">Cette bêta n’est pas un service d’urgence ni d’aide professionnelle.</p>
			<p>La modération examine les situations fictives ; elle ne prend pas en charge les demandes de soutien.</p>
			<p>
				En Suisse, en cas de danger imminent :{" "}
				<a href="tel:117" className="underline">117 — police</a>{" "}·{" "}
				<a href="tel:144" className="underline">144 — urgence médicale</a>.
			</p>
			<p>
				Pour une situation réelle :{" "}
				<a href="tel:142" className="underline">142 — aide aux victimes</a>.{" "}
				Le 142 n’est pas un numéro d’urgence. Les{" "}
				<a href="https://www.aide-aux-victimes.ch/fr/" className="underline" rel="noreferrer">centres LAVI</a>{" "}
				conseillent sur vos droits et les possibilités de soutien.
			</p>
			<p>
				Pour parler :{" "}
				<a href="tel:143" className="underline">143 — La Main Tendue</a>.{" "}
				<Link to="/help" className="underline">Voir les ressources d’aide</Link>.
			</p>
		</aside>
	);
}
