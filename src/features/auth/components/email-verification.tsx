import { useCallback, useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import { authClient } from "@/features/auth/lib/auth-client";

export function EmailVerification({ email }: { email: string }) {
	const [timeToNextResend, setTimeToNextResend] = useState<number>(
		email ? 30 : 0,
	);
	const [manualEmail, setManualEmail] = useState("");
	type Source = {
		email: string;
		userId: string;
		sessionId: string;
		token: string;
	};
	const [consentSource, setConsentSource] = useState<Source | null>(null);
	const consentEmail = consentSource?.email ?? null;

	const [recoverySaved, setRecoverySaved] = useState(false);
	const [isConfirming, setIsConfirming] = useState(false);
	const emailId = useId();
	const destinationEmail = email || manualEmail;
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const startEmailVerificationCountdown = useCallback((time = 30) => {
		// Nettoyer l'interval précédent s'il existe
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		setTimeToNextResend(time);
		intervalRef.current = setInterval(() => {
			setTimeToNextResend((t) => {
				const newT = t - 1;
				if (newT <= 0) {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
					}
					return 0;
				}
				return newT;
			});
		}, 1000);
	}, []);

	useEffect(() => {
		// Démarrer le countdown au montage du composant
		if (email) startEmailVerificationCountdown();

		// Cleanup function pour nettoyer l'interval au démontage
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [email, startEmailVerificationCountdown]);

	const resend = async (destination: string, consent = false) => {
		try {
			// Re-read before confirmation too: consent never authorizes signing out
			// a different, registered session that appeared in the meantime.
			const session = await authClient.getSession({
				query: { disableCookieCache: true },
			});
			if (session.error) {
				setConsentSource(null);
				setRecoverySaved(false);
				return { error: session.error };
			}
			const current = session.data;
			const captureSource = (data: typeof current): Source | null =>
				data?.user.isAnonymous &&
				data.user.email !== destination &&
				data.user.id &&
				data.session?.id &&
				data.session.token
					? {
							email: destination,
							userId: data.user.id,
							sessionId: data.session.id,
							token: data.session.token,
						}
					: null;
			const source = captureSource(current);
			if (
				consent &&
				(!source ||
					!consentSource ||
					source.userId !== consentSource.userId ||
					source.sessionId !== consentSource.sessionId ||
					source.token !== consentSource.token ||
					source.email !== consentSource.email)
			) {
				setConsentSource(source);
				setRecoverySaved(false);
				return {
					error: {
						message:
							"La session a changé. Enregistrez le code de récupération de cette session avant de confirmer à nouveau.",
					},
				};
			}
			if (current?.user.isAnonymous && current.user.email !== destination) {
				if (!source)
					return {
						error: {
							message:
								"Impossible de vérifier la session anonyme. Veuillez recommencer.",
						},
					};
				if (!consent || !consentSource) {
					setConsentSource(source);
					setRecoverySaved(false);
					return {
						error: {
							message:
								"Enregistrez votre code de récupération avant de confirmer la déconnexion.",
						},
					};
				}
				// Native revoke targets the consented token, never the current cookie.
				// A cookie swap cannot turn this into a sign-out of its replacement.
				const result = await authClient.revokeSession({
					token: consentSource.token,
				});
				if (result.error) {
					setConsentSource(null);
					setRecoverySaved(false);
					return { error: result.error };
				}
				// Native status:true may mean no deletion (different current user).
				// Invalidate the old consent before verifying the current session.
				setConsentSource(null);
				setRecoverySaved(false);
				if (result.data?.status !== true) {
					return {
						error: {
							message:
								"Impossible de confirmer la fermeture de la session. Veuillez recommencer.",
						},
					};
				}
				const after = await authClient.getSession({
					query: { disableCookieCache: true },
				});
				if (after.error) return { error: after.error };
				if (after.data) {
					setConsentSource(captureSource(after.data));
					return {
						error: {
							message:
								"La session a changé. Enregistrez le code de récupération de cette session avant de confirmer à nouveau.",
						},
					};
				}
			}
			const result = await authClient.sendVerificationEmail({
				email: destination,
				callbackURL: "/",
			});
			if (!result.error) {
				setConsentSource(null);
				setRecoverySaved(false);
				startEmailVerificationCountdown();
			}
			return result;
		} catch (error) {
			setConsentSource(null);
			setRecoverySaved(false);
			throw error;
		}
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground mt-2">
				Nous vous avons envoyé un email de vérification. Veuillez vérifier votre
				boîte de réception et cliquer sur le lien de vérification pour activer
				votre compte.
			</p>
			{!email && (
				<div className="space-y-2">
					<Label htmlFor={emailId}>Email</Label>
					<Input
						id={emailId}
						type="email"
						autoComplete="email"
						value={manualEmail}
						onChange={(event) => setManualEmail(event.target.value)}
					/>
				</div>
			)}
			<BetterAuthActionButton
				variant="outline"
				className="w-full"
				successMessage="Email de vérification renvoyé avec succès !"
				disabled={
					consentEmail !== null ||
					isConfirming ||
					timeToNextResend > 0 ||
					!z.email().safeParse(destinationEmail).success
				}
				action={() => resend(destinationEmail)}
			>
				{timeToNextResend > 0
					? `Renvoyer l'email dans ${timeToNextResend}s`
					: "Renvoyer l'email de vérification"}
			</BetterAuthActionButton>
			{consentEmail && (
				<section
					className="space-y-3"
					aria-label="Préserver vos publications anonymes"
				>
					<p className="text-sm">
						Pour renvoyer cet email, vous devez quitter votre session anonyme.
						Veuillez enregistrer votre code de récupération avant de continuer :
						vos publications ne seront ni supprimées ni transférées. Après la
						déconnexion, ce code sera nécessaire pour retrouver votre accès
						anonyme. Vérifiez d'abord votre email ; une liaison nécessite un
						compte vérifié.
					</p>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={recoverySaved}
							disabled={isConfirming}
							onChange={(event) => setRecoverySaved(event.target.checked)}
						/>
						J'ai enregistré mon code de récupération et j'accepte la
						déconnexion.
					</label>
					<BetterAuthActionButton
						disabled={!recoverySaved}
						successMessage="Email de vérification renvoyé avec succès !"
						action={async () => {
							setIsConfirming(true);
							try {
								return await resend(consentEmail, recoverySaved);
							} finally {
								setIsConfirming(false);
							}
						}}
					>
						Me déconnecter et renvoyer l'email
					</BetterAuthActionButton>
					<Button
						type="button"
						disabled={isConfirming}
						variant="outline"
						onClick={() => {
							setConsentSource(null);
							setRecoverySaved(false);
						}}
					>
						Annuler et garder ma session anonyme
					</Button>
				</section>
			)}
		</div>
	);
}
