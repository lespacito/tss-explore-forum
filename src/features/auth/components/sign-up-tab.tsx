import { useRouter } from "@tanstack/react-router";
import { useId } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/features/auth/lib/auth-client";
import {
  type SignUpInput,
  signUpSchema,
} from "@/features/auth/schema/sign-up-schema";
import { sendWelcomeEmailFn } from "@/features/auth/server/send-welcome-email";
import { logger } from "@/lib/logger";

export const SignUpTab = () => {
  const id = useId();
  const router = useRouter();

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
      await authClient.signUp.email(
        {
          ...value,
          callbackURL: "/",
        },
        {
          onError: (error) => {
            // Log côté client pour debug
            toast.error(
              "Echec de l'inscription. Veuillez corriger les erreurs du formulaire ou contacter le support.",
            );
            logger.error("Erreur durant l'inscription", error);
          },
          onSuccess: async () => {
            // Succès : envoyer l'email de bienvenue
            await sendWelcomeEmailFn({
              data: {
                email: value.email,
                name: value.name,
              },
            });
            toast.success(
              "Inscription réussie ! Vous êtes maintenant connecté.",
            );
            form.reset();
            router.navigate({ to: "/" });
          },
        },
      );
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
            />
          )}
        </form.AppField>
        <form.AppField name="username">
          {(field) => (
            <field.UsernameInput
              label="Nom d'utilisateur"
              description="Utilisé lors de la connexion et dans votre profil"
            />
          )}
        </form.AppField>
        <form.AppField name="displayUsername">
          {(field) => (
            <field.DisplayUsernameInput
              label="Nom d'affichage"
              description="C'est le nom qui sera visible publiquement"
            />
          )}
        </form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.EmailInput
              label="Email"
              description="Pour recevoir des notifications et récupérer votre compte"
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.PasswordInput
              label="Mot de passe"
              description="Au moins 6 caractères"
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
              S'inscrire
            </ActionButton>
          </Field>
        )}
      </form.Subscribe>
    </form>
  );
};
