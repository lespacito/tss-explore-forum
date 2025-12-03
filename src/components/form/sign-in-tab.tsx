import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import ActionButton from "@/components/ui/action-button";
import { FormField } from "./form-field";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/actions/auth/sign-in-schema";

export const SignInTab = () => {
  const id = useId();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    } satisfies SignInInput,
    validators: {
      onSubmit: signInSchema,
      onBlur: signInSchema,
    },
    onSubmit: async ({ value}) => {
      const { data, error } = await authClient.signIn.username({
        username: value.username,
        password: value.password,
        callbackURL: "/",
      });

      if (error) {
        const errorData = error;
        if (errorData?.message) {
             // Set field-specific error
             // Assuming similar error structure as sign-up
             if ((errorData as any).field) {
               form.setFieldMeta((errorData as any).field, (prev) => ({
                 ...prev,
                 isTouched: true,
                 isValid: false,
                 errors: [(errorData as any).error],
               }));
               toast.error((errorData as any).error || 'Erreur de validation');
             } else {
               toast.error(errorData.message || 'Erreur inconnue');
             }
        }
      } else {
         toast.success("Connexion réussie ! Bienvenue.");
         form.reset();
         await router.invalidate();
         router.navigate({ to: "/" });
      }
    },
    onSubmitInvalid: () => {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
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
      <FieldGroup>
        <form.Field name="username">
          {(field) => (
            <FormField
              field={field}
              label="Nom d'utilisateur"
              type="text"
              placeholder="votre_pseudo"
              autoComplete="username"
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <FormField
              field={field}
              label="Mot de passe"
              placeholder="********"
              autoComplete="current-password"
              isPassword
            />
          )}
        </form.Field>
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
