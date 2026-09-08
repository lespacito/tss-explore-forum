import { Link } from "@tanstack/react-router";
export function SafetyNotice() {
	return (
		<aside className="rounded-xl border border-warning bg-warning/15 p-4 text-sm leading-6">
			<p className="font-semibold">
				Cette plateforme n’est pas un service d’urgence.
			</p>
			<p>
				En Suisse :{" "}
				<a href="tel:117" className="underline">
					117 — police
				</a>{" "}
				·{" "}
				<a href="tel:144" className="underline">
					144 — urgence médicale
				</a>
				.
			</p>
			<p>
				Pour parler :{" "}
				<a href="tel:143" className="underline">
					143 — La Main Tendue
				</a>
				.{" "}
				<Link to="/help" className="underline">
					Voir les ressources d’aide
				</Link>
				.
			</p>
		</aside>
	);
}
