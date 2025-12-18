import { useRouter } from "@tanstack/react-router";
import { useId } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/features/auth/lib/auth-client";
import {
  type SignInInput,
  signInSchema,
} from "@/features/auth/schema/sign-in-schema";
import { logger } from "@/lib/logger";
import { OAuthButtons } from "./auth-buttons";
import { Separator } from "@/components/ui/separator";

export const SignInTab = () => {
  const id = useId();
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      username: "",
      password: "",
    } satisfies SignInInput as SignInInput,
    validators: {
      onSubmit: signInSchema,
      onBlur: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.username(
        {
          username: value.username,
          password: value.password,
          callbackURL: "/",
        },
        {
          onError: (error) => {
            // Erreur d'auth côté client: affiche un toast et log
            toast.error(
              "Échec de la connexion. Vérifiez vos identifiants ou réessayez.",
            );
            logger.error("Erreur durant la connexion", error);
            // Mapping éventuel vers le champ si le backend fournit un field
          },
          onSuccess: () => {
            toast.success("Connexion réussie ! Bienvenue.");
            form.reset();
            router.navigate({ to: "/" });
          },
        },
      );
    },
  });

  return (
    <form
      id={`signIn-form-${id}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* Boutons OAuth */}
      <OAuthButtons />

      {/* Séparateur */}
      <div className="relative">
        <Separator />
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou continuer avec
          </span>
        </div>
      </div>

      {/* Formulaire classique */}
      <FieldGroup>
        <form.AppField name="username">
          {(field) => <field.UsernameInput label="Nom d'utilisateur" />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => <field.CurrentPasswordInput label="Mot de passe" />}
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
              Se connecter
            </ActionButton>
          </Field>
        )}
      </form.Subscribe>
    </form>
  );
};
