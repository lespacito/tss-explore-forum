import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import ActionButton from "@/components/ui/action-button";
import { FormField } from "./form-field";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/actions/auth/sign-in-schema";

export const SignInTab = () => {
  const id = useId();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies SignInInput,
    validators: {
      onSubmit: signInSchema,
      onBlur: signInSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: "/",
        fetchOptions: {
          onResponse: () => {
             // Optional: handle raw response
          },
          onRequest: () => {
            // Optional: handle request start
          },
          onSuccess: async () => {
             toast.success("Connexion réussie ! Bienvenue.");
             form.reset();
             await router.invalidate();
             router.navigate({ to: "/" });
          },
          onError: async (ctx) => {
             if (ctx.response) {
               try {
                 const data = await ctx.response.clone().json();
                 if (data.field) {
                   formApi.setErrorMap({
                     [data.field]: data.error,
                   });
                 }
                 toast.error(data.error || ctx.error.message);
                 return;
               } catch {
                 // Ignore JSON parse errors
               }
             }
             toast.error(ctx.error.message);
          }
        }
      });
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
