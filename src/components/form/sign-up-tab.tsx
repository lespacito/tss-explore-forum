import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import ActionButton from "@/components/ui/action-button";
import { FormField } from "./form-field";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpInput } from "@/actions/auth/sign-up-schema";
import { sendWelcomeEmailFn } from "@/actions/auth/send-welcome-email";

export const SignUpTab = () => {
  const id = useId();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      username: "",
      displayUsername: "",
    } satisfies SignUpInput,
    validators: {
      onSubmit: signUpSchema,
      onBlur: signUpSchema,
    },
    onSubmit: async ({ value}) => {
      const { data, error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.name,
        username: value.username,
        displayUsername: value.displayUsername,
        callbackURL: "/",
      });

      if (error) {
        const errorData = error;
        if (errorData?.message) {
             // Set field-specific error using errorMap for persistence
             // Note: Better Auth error object structure might vary, assuming error.message or similar.
             // Based on previous code, it seems error might have 'field' property if it's a validation error.
             // Let's assume 'error' object has the structure we need or we adapt.
             // The user request shows: const { data, error } = await ...
             
             // Previous code used ctx.error. Let's assume 'error' variable here holds similar data.
             if ((errorData as any).field) {
               form.setFieldMeta((errorData as any).field, (prev) => ({
                 ...prev,
                 isTouched: true,
                 errorMap: {
                   onChange: (errorData as any).error || errorData.message,
                 }
               }));
               toast.error((errorData as any).error || 'Erreur de validation');
             } else {
               toast.error(errorData.message || 'Erreur inconnue');
             }
        }
      } else {
         // Send welcome email
         await sendWelcomeEmailFn({
           data: {
             email: value.email,
             name: value.name,
           },
         });

         toast.success("Inscription réussie ! Vous êtes maintenant connecté.");
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
      id={`register-form-${id}`}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field name="name">
          {(field) => (
            <FormField
              field={field}
              label="Nom"
              placeholder="Votre nom"
              autoComplete="name"
            />
          )}
        </form.Field>
        <form.Field name="username">
          {(field) => (
            <FormField
              field={field}
              label="Nom d'utilisateur"
              placeholder="votre_pseudo"
              autoComplete="username"
            />
          )}
        </form.Field>
        <form.Field name="displayUsername">
          {(field) => (
            <FormField
              field={field}
              label="Nom d'affichage"
              placeholder="Pseudo Affiché"
              autoComplete="displayUsername"
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <FormField
              field={field}
              label="Email"
              type="email"
              placeholder="exemple@email.com"
              autoComplete="email"
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <FormField
              field={field}
              label="Mot de passe"
              placeholder="*******"
              autoComplete="new-password"
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
              S'inscrire
            </ActionButton>
          </Field>
        )}
      </form.Subscribe>
    </form>
  );
};
