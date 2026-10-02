import { useCallback, useEffect, useId, useRef, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import { authClient } from "@/features/auth/lib/auth-client";

export function EmailVerification({ email }: { email: string }) {
	const [timeToNextResend, setTimeToNextResend] = useState<number>(
		email ? 30 : 0,
	);
	const [manualEmail, setManualEmail] = useState("");
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
					timeToNextResend > 0 || !z.email().safeParse(destinationEmail).success
				}
				action={() => {
					startEmailVerificationCountdown();
					return authClient.sendVerificationEmail({
						email: destinationEmail,
						callbackURL: "/",
					});
				}}
			>
				{timeToNextResend > 0
					? `Renvoyer l'email dans ${timeToNextResend}s`
					: "Renvoyer l'email de vérification"}
			</BetterAuthActionButton>
		</div>
	);
}
