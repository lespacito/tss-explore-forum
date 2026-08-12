import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/features/auth/lib/auth-client";
import { parseChangePasswordError } from "@/features/auth/lib/client/parse-auth-error";
import { logger } from "@/lib/logger";
import {
	type ChangePasswordFormSchema,
	changePasswordSchema,
} from "../schemas/change-password-schema";

type FormErrors = Partial<Record<keyof ChangePasswordFormSchema, string>>;

export const ChangePasswordForm = () => {
	const [serverErrors, setServerErrors] = useState<FormErrors>({});
	const id = useId();
	const router = useRouter();

	const form = useAppForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			revokeOtherSessions: true,
		} as ChangePasswordFormSchema,
		validators: {
			onSubmit: changePasswordSchema,
			onBlur: changePasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setServerErrors({});

			try {
				const result = await authClient.changePassword(value);

				if (result && "error" in result && result.error) {
					const parsed = parseChangePasswordError(result.error);
					const errors: FormErrors = {};

					// Map general errors or specific field errors
					// Note: simple password change might return generic error or field error
					if (
						parsed.field &&
						(parsed.field === "currentPassword" ||
							parsed.field === "newPassword")
					) {
						errors[parsed.field] = parsed.message;
					} else {
						toast.error(
							parsed.message || "Erreur lors du changement de mot de passe",
						);
					}

					setServerErrors(errors);
					return;
				}

				toast.success("Mot de passe modifié avec succès !");
				form.reset();
				router.invalidate();
			} catch (error) {
				logger.error("Exception during password change", {
					error: error instanceof Error ? error.message : String(error),
				});
				toast.error("Une erreur inattendue s'est produite");
			}
		},
	});

	return (
		<form
			id={`profile-update-form-${id}`}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<FieldGroup>
				<form.AppField name="currentPassword">
					{(field) => (
						<field.PasswordInput
							label="Mot de passe actuel"
							description="Votre mot de passe actuel"
							aria-invalid={!!serverErrors.currentPassword}
						/>
					)}
				</form.AppField>
				{serverErrors.currentPassword && (
					<p className="text-sm text-destructive">
						{serverErrors.currentPassword}
					</p>
				)}

				<form.AppField name="newPassword">
					{(field) => (
						<field.PasswordInput
							label="Nouveau mot de passe"
							description="Votre nouveau mot de passe"
							aria-invalid={!!serverErrors.newPassword}
						/>
					)}
				</form.AppField>
				{serverErrors.newPassword && (
					<p className="text-sm text-destructive">{serverErrors.newPassword}</p>
				)}

				<form.AppField name="revokeOtherSessions">
					{(field) => (
						<field.CheckboxInput
							label="Revoquer les autres sessions"
							description="Revoquer les autres sessions sur d'autres appareils"
							aria-invalid={!!serverErrors.revokeOtherSessions}
						/>
					)}
				</form.AppField>
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
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
							disabled={isSubmitting || !isDirty}
						>
							Annuler
						</Button>
						<ActionButton
							isPending={isSubmitting}
							disabled={!canSubmit || isSubmitting}
						>
							Changer le mot de passe
						</ActionButton>
					</Field>
				)}
			</form.Subscribe>
		</form>
	);
};
