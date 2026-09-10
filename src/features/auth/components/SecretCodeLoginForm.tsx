import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger/client-logger";
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

function getValidationMessage(error: unknown): string {
	if (typeof error === "string") return error;
	if (error instanceof Error) return error.message;
	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}
	return "Une erreur de validation est survenue.";
}

export function SecretCodeLoginForm({
	redirectTo,
}: {
	redirectTo?: string;
} = {}) {
	const router = useRouter();
	const secretCodeId = useId();
	const codeHelpId = useId();
	const validationErrorId = useId();
	const serverErrorId = useId();
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
				const result = await signIn.credentials({
					secretCode: value.secretCode,
				});
				if (result.error) {
					setServerError("Impossible de se connecter. Vérifiez votre code.");
					return;
				}

				toast.success("Session retrouvée", {
					description: "Voici vos publications.",
				});
				router.navigate({ to: redirectTo || "/account/profile" });
			} catch {
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
			aria-busy={isSubmitting}
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field name="secretCode">
					{(field) => {
						const validationError = field.state.meta.errors?.[0];
						const describedBy = [
							codeHelpId,
							validationError ? validationErrorId : null,
							serverError ? serverErrorId : null,
						]
							.filter(Boolean)
							.join(" ");

						return (
							<Field data-invalid={Boolean(validationError || serverError)}>
								<Label htmlFor={secretCodeId}>Code Secret</Label>
								<Input
									id={secretCodeId}
									type="text"
									value={field.state.value}
									onChange={(e) => {
										setServerError(null);
										field.handleChange(formatSecretCode(e.target.value));
									}}
									onBlur={field.handleBlur}
									placeholder="AB7K-9X2M"
									aria-describedby={describedBy}
									aria-invalid={Boolean(validationError || serverError)}
									autoComplete="off"
									autoCapitalize="characters"
								/>
								<span id={codeHelpId} className="text-sm text-muted-foreground">
									Format: XXXX-XXXX ou XXXX-XXXX-XXXX
								</span>
								{validationError && (
									<span
										id={validationErrorId}
										className="text-sm text-destructive"
										role="alert"
									>
										{getValidationMessage(validationError)}
									</span>
								)}
							</Field>
						);
					}}
				</form.Field>

				{serverError && (
					<div
						id={serverErrorId}
						className="text-sm text-destructive"
						role="alert"
					>
						{serverError}
					</div>
				)}

				<div className="flex gap-2">
					<Button type="submit" disabled={isSubmitting} className="flex-1">
						{isSubmitting ? "Connexion…" : "Se connecter"}
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={handlePaste}
						aria-label="Coller le code depuis le presse-papiers"
					>
						Coller
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
