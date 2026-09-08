import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eraseBetaAccount } from "@/features/beta/server/erase-account";
export function EraseAccountForm({ anonymous }: { anonymous: boolean }) {
	const confirmationId = useId();
	const passwordId = useId();
	const [confirmation, setConfirmation] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	return (
		<form
			className="space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				if (pending || confirmation !== "EFFACER") return;
				setPending(true);
				setError("");
				try {
					await eraseBetaAccount({
						data: { confirmation: "EFFACER", password: password || undefined },
					});
					try {
						for (const key of Object.keys(localStorage))
							if (key.startsWith("draft-thread-")) localStorage.removeItem(key);
					} catch {}
					window.location.assign("/beta?leave=1");
				} catch (e) {
					setError(
						e instanceof Error
							? e.message
							: "La suppression n’a pas été confirmée. Réessayez.",
					);
					setPending(false);
				}
			}}
		>
			<h2 className="font-serif text-2xl font-semibold">
				Effacer mon compte et mes publications
			</h2>
			<p>
				Cette action est définitive. Vos publications, vos alias, votre code
				secret et toutes vos sessions seront supprimés de la base active. Les
				sauvegardes suivent le cycle de conservation communiqué par
				l’organisateur.
			</p>
			<Label htmlFor={confirmationId}>Saisissez EFFACER pour confirmer</Label>
			<Input
				id={confirmationId}
				value={confirmation}
				onChange={(e) => setConfirmation(e.target.value)}
				autoComplete="off"
				required
			/>
			{!anonymous && (
				<>
					<Label htmlFor={passwordId}>Mot de passe actuel</Label>
					<Input
						id={passwordId}
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</>
			)}
			{error && <p role="alert">{error}</p>}
			<Button
				type="submit"
				variant="destructive"
				disabled={
					pending || confirmation !== "EFFACER" || (!anonymous && !password)
				}
			>
				{pending ? "Effacement en cours…" : "Effacer définitivement"}
			</Button>
		</form>
	);
}
