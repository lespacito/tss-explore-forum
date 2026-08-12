import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/features/auth/lib/auth-client";
import {
	type ResetPasswordInput,
	resetPasswordSchema,
} from "@/features/auth/schemas/reset-password-schema";
import { logger } from "@/lib/logger";

const resetPasswordSearchSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password/")({
	validateSearch: (search) => resetPasswordSearchSchema.parse(search),
	component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
	const router = useRouter();
	const { token } = Route.useSearch();
	const id = useId();
	const [serverErrors, setServerErrors] = useState<
		Partial<Record<keyof ResetPasswordInput, string>>
	>({});
	const form = useAppForm({
		defaultValues: {
			password: "",
		} satisfies ResetPasswordInput as ResetPasswordInput,
		validators: {
			onSubmit: resetPasswordSchema,
			onBlur: resetPasswordSchema,
		},
		onSubmit: async ({ value }) => {
			// Réinitialiser les erreurs serveur au début de la soumission
			setServerErrors({});

			if (!token) {
				toast.error("Le lien de réinitialisation est invalide ou a expiré");
				setServerErrors({ password: "Token de réinitialisation manquant" });
				return;
			}
			await authClient.resetPassword(
				{
					newPassword: value.password,
					token: token || "",
				},
				{
					onError: (error) => {
						logger.error("Erreur durant la demande de réinitialisation", {
							message: error instanceof Error ? error.message : String(error),
							stack: error instanceof Error ? error.stack : undefined,
						});

						// Afficher le message dans un toast
						toast.error(
							"Une erreur est survenue. Veuillez réessayer plus tard.",
						);

						// Map error to field if applicable
						if (
							error instanceof Error &&
							error.message.toLowerCase().includes("password")
						) {
							setServerErrors({ password: error.message });
						}
					},
					onSuccess: () => {
						toast.success(
							"Votre mot de passe a été réinitialisé avec succès.",
							{ description: "Redirection vers la page de connexion..." },
						);
						form.reset();
						// Optionnel: rediriger vers l'onglet de connexion après quelques secondes
						setTimeout(() => {
							router.navigate({ to: "/auth/login" });
						}, 2000);
					},
				},
			);
		},
	});

	if (!token) {
		return (
			<div className="my-6 px-4 mx-auto flex justify-center">
				<Card className="w-full max-w-md ">
					<CardHeader>
						<CardTitle className="text-2xl">
							Lien de réinitialisation invalide
						</CardTitle>
						<CardDescription>
							Veuillez vérifier le lien dans votre email ou demander un nouveau
							lien de réinitialisation.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full" asChild>
							<Link to="/auth/login">Demander un nouveau lien</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="my-6 px-4 mx-auto flex justify-center">
			<Card className="w-full max-w-md ">
				<CardHeader>
					<CardTitle className="text-2xl">
						Réinitialiser votre mot de passe
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						id={`reset-password-form-${id}`}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						{/* Formulaire */}
						<FieldGroup>
							<form.AppField name="password">
								{(field) => (
									<field.PasswordInput
										label="Mot de passe"
										aria-invalid={!!serverErrors.password}
									/>
								)}
							</form.AppField>
							{serverErrors.password && (
								<p className="text-sm text-destructive">
									{serverErrors.password}
								</p>
							)}
						</FieldGroup>

						<form.Subscribe
							selector={(state) => ({
								isSubmitting: state.isSubmitting,
								canSubmit: state.canSubmit,
								isDirty: state.isDirty,
							})}
						>
							{({ isSubmitting, canSubmit, isDirty }) => (
								<Field orientation="horizontal">
									<ActionButton
										isPending={isSubmitting}
										disabled={!canSubmit || isSubmitting}
									>
										Réinitialiser le mot de passe
									</ActionButton>
								</Field>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
