import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { SecretCodeDisplay } from "@/features/auth/components/SecretCodeDisplay";
import { usePublicationReceipt } from "@/features/beta/components/publication-receipt";
export const Route = createFileRoute("/threads/confirmation")({
	component: Confirmation,
	validateSearch: () => ({}),
});
function Confirmation() {
	const nextStepsId = useId();
	const {
		secretCode,
		setSecretCode,
		submissionConfirmed,
		setSubmissionConfirmed,
	} = usePublicationReceipt();
	useEffect(
		() => () => {
			setSecretCode("");
			setSubmissionConfirmed(false);
		},
		[setSecretCode, setSubmissionConfirmed],
	);
	return (
		<div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
			<h1 className="font-serif text-3xl font-semibold">
				{submissionConfirmed
					? "Publication envoyée pour modération"
					: "Suivre votre dépôt"}
			</h1>
			{submissionConfirmed ? (
				<div className="space-y-2" aria-live="polite">
					<p className="text-lg font-semibold">Statut actuel : en attente</p>
					<p>
						Votre message n’est pas encore visible par les invités. Il sera
						examiné par le modérateur avant toute publication.
					</p>
				</div>
			) : (
				<p>
					Consultez Mes publications pour vérifier le statut de vos dépôts et
					lire un éventuel motif de refus.
				</p>
			)}
			{submissionConfirmed &&
				(secretCode ? (
					<section
						aria-labelledby={nextStepsId}
						className="space-y-3 border-y py-5"
					>
						<h2 id={nextStepsId} className="font-serif text-xl font-semibold">
							Pour retrouver votre dépôt
						</h2>
						<ol className="space-y-3">
							<li className="flex gap-3">
								<span
									aria-hidden="true"
									className="font-mono text-sm font-semibold text-primary"
								>
									1.
								</span>
								<span>
									<strong className="font-semibold">
										Conservez votre code secret.
									</strong>{" "}
									Il permet de retrouver votre session.
								</span>
							</li>
							<li className="flex gap-3">
								<span
									aria-hidden="true"
									className="font-mono text-sm font-semibold text-primary"
								>
									2.
								</span>
								<span>
									<strong className="font-semibold">
										Ouvrez Mes publications.
									</strong>{" "}
									Vous y verrez la décision du modérateur.
								</span>
							</li>
						</ol>
					</section>
				) : (
					<p className="font-medium">
						Prochaine étape : ouvrez Mes publications pour suivre la décision du
						modérateur.
					</p>
				))}
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
