import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { signUp } from "@/features/auth/lib/auth-client";
import {
  type SignUpInput,
  signUpSchema,
} from "@/features/auth/schemas/sign-up-schema";
import { sendWelcomeEmailFn } from "@/features/auth/server/send-welcome-email";
import { logger } from "@/lib/logger";
import { parseSignUpError } from "@/features/auth/lib/client/parse-auth-error";

export const SignUpTab = ({
  openEmailVerificationTab,
}: {
  openEmailVerificationTab: (email: string) => void;
}) => {
  const id = useId();
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<keyof SignUpInput, string>>
  >({});

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      username: "",
      displayUsername: "",
    } satisfies SignUpInput as SignUpInput,
    validators: {
      onSubmit: signUpSchema,
      onBlur: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      // Réinitialiser les erreurs serveur au début de la soumission
      setServerErrors({});

      const res = await signUp.email(
        {
          ...value,
          callbackURL: "/",
        },
        {
          onError: (error) => {
            // Parser l'erreur avec le parseur centralisé
            const parsed = parseSignUpError(error);

            // Afficher le message dans un toast
            toast.error(parsed.message);

            // Logger l'erreur pour le debug
            logger.error("Erreur durant l'inscription", {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              parsedField: parsed.field,
            });

            // Mapper l'erreur vers le champ spécifique si identifié
            if (parsed.field) {
              setServerErrors({ [parsed.field]: parsed.message });
            }
          },
          onSuccess: async () => {
            await sendWelcomeEmailFn({
              data: {
                email: value.email,
                name: value.name,
              },
            });
            toast.success("Inscription réussie ! Bienvenue à bord !");
            form.reset();
          },
        },
      );
      if (res.error == null && !res.data.user.emailVerified) {
        // L'utilisateur n'a pas encore vérifié son email
        openEmailVerificationTab(value.email);
      }
    },
  });

  return (
    <form
      id={`register-form-${id}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.AppField name="name">
          {(field) => (
            <field.Input
              label="Nom"
              description="Utilisé pour personnaliser vos emails de bienvenue"
              aria-invalid={!!serverErrors.name}
            />
          )}
        </form.AppField>
        {serverErrors.name && (
          <p className="text-sm text-destructive">{serverErrors.name}</p>
        )}

        <form.AppField name="username">
          {(field) => (
            <field.UsernameInput
              label="Nom d'utilisateur"
              description="Utilisé lors de la connexion et dans votre profil"
              aria-invalid={!!serverErrors.username}
            />
          )}
        </form.AppField>
        {serverErrors.username && (
          <p className="text-sm text-destructive">{serverErrors.username}</p>
        )}

        <form.AppField name="displayUsername">
          {(field) => (
            <field.DisplayUsernameInput
              label="Nom d'affichage"
              description="C'est le nom qui sera visible publiquement"
              aria-invalid={!!serverErrors.displayUsername}
            />
          )}
        </form.AppField>
        {serverErrors.displayUsername && (
          <p className="text-sm text-destructive">
            {serverErrors.displayUsername}
          </p>
        )}

        <form.AppField name="email">
          {(field) => (
            <field.EmailInput
              label="Email"
              description="Pour recevoir des notifications et récupérer votre compte"
              aria-invalid={!!serverErrors.email}
            />
          )}
        </form.AppField>
        {serverErrors.email && (
          <p className="text-sm text-destructive">{serverErrors.email}</p>
        )}

        <form.AppField name="password">
          {(field) => (
            <field.PasswordInput
              label="Mot de passe"
              description="Au moins 6 caractères"
              aria-invalid={!!serverErrors.password}
            />
          )}
        </form.AppField>
        {serverErrors.password && (
          <p className="text-sm text-destructive">{serverErrors.password}</p>
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
              type="button"
              variant="outline"
              isPending={isSubmitting}
              onClick={() => form.reset()}
              disabled={isSubmitting || !isDirty}
            >
              Annuler
            </ActionButton>
            <ActionButton
              isPending={isSubmitting}
              disabled={!canSubmit || isSubmitting}
            >
              S'inscrire
            </ActionButton>
          </Field>
        )}
      </form.Subscribe>
    </form>
  );
};
