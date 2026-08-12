import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { logger } from "@/lib/logger/client-logger";
import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "../lib/auth-client";

const formSchema = z.object({
	secretCode: z
		.string()
		.min(9, { message: "Le code secret est trop court" })
		.regex(/^[A-Z2-9]{4}-[A-Z2-9]{4}(-[A-Z2-9]{4})?$/, {
			message: "Format invalide",
		}),
});

type FormValues = z.infer<typeof formSchema>;

export function SecretCodeLoginForm({ redirectTo }: { redirectTo?: string } = {}) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues: {
			secretCode: "",
		} satisfies FormValues as FormValues,
		validators: {
			onChange: formSchema,
			onBlur: formSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			setServerError(null);

			try {
				// Utiliser le plugin credentials avec providerId "secret-code"
				await signIn.credentials({
					secretCode: value.secretCode,
					providerId: "secret-code",
				});

				// Succès - redirection
				router.navigate({ to: redirectTo || "/threads" });
			} catch (error) {
				// Afficher erreur bienveillante (pas "code invalide")
				setServerError("Impossible de se connecter. Vérifiez votre code.");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			const cleaned = sanitizeSecretCode(text);
			const formatted = formatSecretCode(cleaned);
			form.setFieldValue("secretCode", formatted);
		} catch (err) {
			// Permission refusée ou clipboard non disponible
			logger.warn("Impossible d'accéder au presse-papiers", err);
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field name="secretCode">
					{(field) => (
						<Field>
							<Label htmlFor="secretCode">Code Secret</Label>
							<Input
								id="secretCode"
								type="text"
								value={field.state.value}
								onChange={(e) =>
									field.handleChange(formatSecretCode(e.target.value))
								}
								onBlur={field.handleBlur}
								placeholder="AB7K-9X2M"
								aria-describedby="code-help"
								autoComplete="off"
								autoCapitalize="characters"
							/>
							<span id="code-help" className="text-sm text-muted-foreground">
								Format: XXXX-XXXX ou XXXX-XXXX-XXXX
							</span>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<span className="text-sm text-destructive" role="alert">
										{String(field.state.meta.errors[0])}
									</span>
								)}
						</Field>
					)}
				</form.Field>

				{serverError && (
					<div className="text-sm text-destructive" role="alert">
						{serverError}
					</div>
				)}

				<div className="flex gap-2">
					<Button type="submit" disabled={isSubmitting} className="flex-1">
						{isSubmitting ? "Connexion..." : "Se connecter"}
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={handlePaste}
						aria-label="Coller le code depuis le presse-papiers"
					>
						Coller le code
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}

// Auto-formater avec tirets pendant la saisie
function formatSecretCode(input: string): string {
	const clean = input.replace(/[^A-Z2-9]/gi, "").toUpperCase();
	const chunks = clean.match(/.{1,4}/g) || [];
	return chunks.join("-");
}

// Sanitization pour input utilisateur
function sanitizeSecretCode(input: string): string {
	return input
		.trim() // Supprimer espaces début/fin
		.toUpperCase() // Convertir en majuscules
		.replace(/\s/g, ""); // Supprimer espaces internes
}
