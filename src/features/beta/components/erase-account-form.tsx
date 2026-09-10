import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eraseBetaAccount } from "@/features/beta/server/erase-account";
export function EraseAccountForm({ anonymous }: { anonymous: boolean }) {
	const confirmationId = useId();
	const passwordId = useId();
	const descriptionId = useId();
	const errorId = useId();
	const [confirmation, setConfirmation] = useState("");
	const [password, setPassword] = useState("");
	const [pending, setPending] = useState(false);
	const [error, setError] = useState("");
	return (
		<form
			aria-busy={pending}
			aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
			className="space-y-4"
			onSubmit={async (event) => {
				event.preventDefault();
				if (pending || confirmation !== "EFFACER") return;
				setPending(true);
				setError("");
				try {
					const result = await eraseBetaAccount({
						data: { confirmation: "EFFACER", password: password || undefined },
					});
					if (!result.success)
						throw new Error("La suppression n’a pas été confirmée. Réessayez.");
					try {
						for (const key of Object.keys(localStorage))
							if (key.startsWith("draft-thread-")) localStorage.removeItem(key);
					} catch {}
					window.location.assign("/beta?leave=erased");
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
			<p id={descriptionId} className="leading-7 text-muted-foreground">
				Cette action définitive supprime vos publications, alias, code secret et
				sessions de la base active. Une copie peut subsister sept jours
				supplémentaires dans une sauvegarde.
			</p>
			<Label htmlFor={confirmationId}>Saisissez EFFACER pour confirmer</Label>
			<Input
				id={confirmationId}
				value={confirmation}
				onChange={(e) => {
					setError("");
					setConfirmation(e.target.value.toUpperCase());
				}}
				autoComplete="off"
				autoCapitalize="characters"
				spellCheck={false}
				maxLength={7}
				aria-invalid={Boolean(error)}
				aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
				required
				disabled={pending}
			/>
			{!anonymous && (
				<>
					<Label htmlFor={passwordId}>Mot de passe actuel</Label>
					<Input
						id={passwordId}
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(e) => {
							setError("");
							setPassword(e.target.value);
						}}
						aria-invalid={Boolean(error)}
						aria-describedby={`${descriptionId}${error ? ` ${errorId}` : ""}`}
						required
						disabled={pending}
					/>
				</>
			)}
			{error && (
				<p id={errorId} className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
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
