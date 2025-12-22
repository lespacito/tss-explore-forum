import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/features/auth/lib/auth-client";
import { logger } from "@/lib/logger";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/features/auth/schemas/forgot-password-schema";

export const ForgotPassword = ({
  openSignInTab,
}: {
  openSignInTab: () => void;
}) => {
  const id = useId();
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<keyof ForgotPasswordInput, string>>
  >({});
  const [pendingRedirect, setPendingRedirect] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (pendingRedirect) {
      timeoutId = setTimeout(() => {
        openSignInTab();
        setPendingRedirect(false);
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [pendingRedirect, openSignInTab]);

  const form = useAppForm({
    defaultValues: {
      email: "",
    } satisfies ForgotPasswordInput as ForgotPasswordInput,
    validators: {
      onSubmit: forgotPasswordSchema,
      onBlur: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      // Réinitialiser les erreurs serveur au début de la soumission
      setServerErrors({});

      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: "/auth/reset-password",
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
          },
          onSuccess: () => {
            toast.success(
              "Si un compte avec cet email existe, un email de réinitialisation a été envoyé.",
            );
            form.reset();
            setPendingRedirect(true);
          },
        },
      );
    },
  });

  return (
    <form
      id={`forgot-password-form-${id}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">
        Entrez votre adresse email et nous vous enverrons un lien pour
        réinitialiser votre mot de passe.
      </p>

      {/* Formulaire */}
      <FieldGroup>
        <form.AppField name="email">
          {(field) => (
            <field.EmailInput
              label="Email"
              aria-invalid={!!serverErrors.email}
            />
          )}
        </form.AppField>
        {serverErrors.email && (
          <p className="text-sm text-destructive">{serverErrors.email}</p>
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
            <Button
              type="button"
              variant="outline"
              onClick={openSignInTab}
              disabled={isSubmitting}
            >
              Retour
            </Button>
            <ActionButton
              isPending={isSubmitting}
              disabled={!canSubmit || isSubmitting}
            >
              Envoyer le lien
            </ActionButton>
          </Field>
        )}
      </form.Subscribe>
    </form>
  );
};
