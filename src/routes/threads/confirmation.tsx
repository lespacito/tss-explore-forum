import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SecretCodeDisplay } from "@/features/auth/components/SecretCodeDisplay";
import { usePublicationReceipt } from "@/features/beta/components/publication-receipt";
export const Route = createFileRoute("/threads/confirmation")({
	component: Confirmation,
	validateSearch: () => ({}),
});
function Confirmation() {
	const { secretCode, setSecretCode } = usePublicationReceipt();
	useEffect(() => () => setSecretCode(""), [setSecretCode]);
	return (
		<div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
			<h1 className="font-serif text-3xl font-semibold">Suivre votre dépôt</h1>
			<p>
				Chaque message envoyé attend la décision du modérateur avant d’être
				visible par les invités. Consultez Mes publications pour vérifier son
				statut et lire un éventuel motif de refus.
			</p>
			{secretCode && <SecretCodeDisplay secretCode={secretCode} />}
			<p className="text-muted-foreground">
				Les créneaux d’examen sont précisés dans votre invitation. Aucune
				notification par email n’est envoyée aux sessions anonymes.
			</p>
			<Button asChild>
				<Link to="/account/profile">
					{secretCode
						? "J’ai conservé mon code — voir mes publications"
						: "Voir mes publications"}
				</Link>
			</Button>
			<p className="text-sm text-muted-foreground">
				Après un rechargement, votre code reste consultable depuis Mes
				publications tant que votre session est ouverte.
			</p>
		</div>
	);
}
