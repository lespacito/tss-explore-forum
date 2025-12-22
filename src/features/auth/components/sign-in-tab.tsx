import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { signIn } from "@/features/auth/lib/auth-client";
import {
  type SignInInput,
  signInSchema,
} from "@/features/auth/schemas/sign-in-schema";
import { logger } from "@/lib/logger";
import { SocialAuthButtons } from "@/features/auth/components/social-auth-buttons";
import { Separator } from "@/components/ui/separator";
import { parseSignInError } from "@/features/auth/lib/client/parse-auth-error";
import { getUserEmailByUsername } from "@/features/auth/server/get-user-email-by-username";

export const SignInTab = ({
  openEmailVerificationTab,
  openForgotPassword,
}: {
  openEmailVerificationTab: (email: string) => void;
  openForgotPassword: () => void;
}) => {
  const id = useId();
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<keyof SignInInput, string>>
  >({});

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
      // Réinitialiser les erreurs serveur au début de la soumission
      setServerErrors({});

      const result = await signIn.username(
        {
          username: value.username,
          password: value.password,
          callbackURL: "/",
        },
        {
          onError: async (error) => {
            // Parser l'erreur avec le parseur centralisé
            const parsed = parseSignInError(error);

            // Vérifier si l'email n'est pas vérifiéa
            const errorCode = (error as { error?: { code?: string } }).error
              ?.code;
            if (errorCode === "EMAIL_NOT_VERIFIED") {
              // Récupérer l'email par username
              try {
                const emailResult = await getUserEmailByUsername({
                  data: { username: value.username },
                });

                if (emailResult.email) {
                  openEmailVerificationTab(emailResult.email);
                  toast.info(
                    "Veuillez vérifier votre email avant de vous connecter.",
                  );
                  return;
                }
              } catch (err) {
                logger.error("Impossible de récupérer l'email", { err });
                toast.error(
                  "Impossible de récuperer l'email. Merci de contacter le support.",
                );
              }
            }

            // Afficher le message dans un toast
            toast.error(parsed.message);

            // Logger l'erreur pour le debug
            logger.error("Erreur durant la connexion", {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              parsedField: parsed.field,
            });

            // Mapper l'erreur vers le champ spécifique si identifié
            if (parsed.field) {
              setServerErrors({ [parsed.field]: parsed.message });
            }
          },
          onSuccess: () => {
            toast.success("Connexion réussie ! Bienvenue à bord !");
            form.reset();
            router.navigate({ to: "/" });
          },
        },
      );

      // Vérifier si l'utilisateur n'a pas vérifié son email (cas où pas d'erreur mais pas de session)
      if (result?.data?.user && !result.data.user.emailVerified) {
        openEmailVerificationTab(result.data.user.email);
        toast.info("Veuillez vérifier votre email avant de vous connecter.");
      }
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
      <SocialAuthButtons />

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
          {(field) => (
            <field.UsernameInput
              label="Nom d'utilisateur"
              aria-invalid={!!serverErrors.username}
            />
          )}
        </form.AppField>
        {serverErrors.username && (
          <p className="text-sm text-destructive">{serverErrors.username}</p>
        )}

        <form.AppField name="password">
          {(field) => (
            <field.CurrentPasswordInput
              label="Mot de passe"
              aria-invalid={!!serverErrors.password}
            />
          )}
        </form.AppField>
        {serverErrors.password && (
          <p className="text-sm text-destructive">{serverErrors.password}</p>
        )}
      </FieldGroup>

      {/* Lien mot de passe oublié */}
      <div className="flex justify-between items-center">
        <Button
          onClick={openForgotPassword}
          type="button"
          variant="link"
          size="sm"
          className="text-sm font-normal underline cursor-pointer"
        >
          Mot de passe oublié ?
        </Button>
      </div>

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
