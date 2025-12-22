import { useId, useState } from "react";
import {
  profileUpdateSchema,
  type ProfileUpdateFormSchema,
} from "@/features/profiles/schema/profile-update-form-schema";
import { useAppForm } from "@/components/form/hooks";
import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/ui/action-button";
import { authClient } from "@/features/auth/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { parseProfileUpdateError } from "@/features/auth/lib/client/parse-auth-error";
import { logger } from "@/lib/logger";

export const ProfileUpdateForm = ({
  user,
}: {
  user: {
    name: string;
    email: string;
    displayUsername: string | null;
  };
}) => {
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<keyof ProfileUpdateFormSchema, string>>
  >({});
  const id = useId();
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      name: user.name,
      displayUsername: user.displayUsername || "",
      email: user.email,
    } satisfies ProfileUpdateFormSchema as ProfileUpdateFormSchema,
    validators: {
      onSubmit: profileUpdateSchema,
      onBlur: profileUpdateSchema,
    },
    onSubmit: async ({ value }) => {
      setServerErrors({});

      // Step 1: Update user profile first
      let updateUserResult;
      try {
        updateUserResult = await authClient.updateUser({
          name: value.name,
          displayUsername: value.displayUsername,
        });
      } catch (error) {
        logger.error("Exception during user profile update", {
          error: error instanceof Error ? error.message : String(error),
        });
        toast.error(
          "Une erreur inattendue s'est produite lors de la mise à jour du profil",
        );
        return;
      }

      // Check if updateUser failed
      if (updateUserResult?.error) {
        const parsed = parseProfileUpdateError(updateUserResult.error);

        toast.error(
          parsed.message ||
            updateUserResult.error.message ||
            "Impossible de mettre à jour ton profil",
        );

        logger.error("Erreur durant la mise à jour du profil", {
          message: updateUserResult.error.message,
          parsedField: parsed.field,
        });

        if (
          parsed.field &&
          (parsed.field === "name" || parsed.field === "displayUsername")
        ) {
          setServerErrors((prev) => ({
            ...prev,
            [parsed.field as keyof ProfileUpdateFormSchema]: parsed.message,
          }));
        }
        return; // Early return on updateUser failure
      }

      // Step 2: If email changed, update it sequentially
      const emailChanged = value.email !== user.email;
      if (emailChanged) {
        let emailResult;
        try {
          emailResult = await authClient.changeEmail({
            newEmail: value.email,
            callbackURL: "/account/profile",
          });
        } catch (error) {
          logger.error("Exception during email change", {
            error: error instanceof Error ? error.message : String(error),
          });
          toast.warning(
            "Profil mis à jour, mais une erreur s'est produite lors du changement d'email. Réessaye plus tard.",
          );
          router.invalidate();
          return;
        }

        // Check if changeEmail failed
        if (emailResult?.error) {
          const parsed = parseProfileUpdateError(emailResult.error);

          toast.warning(
            `Profil mis à jour, mais impossible de changer l'email : ${parsed.message || emailResult.error.message || "erreur inconnue"}`,
          );

          logger.error("Erreur durant le changement d'email", {
            message: emailResult.error.message,
            parsedField: parsed.field,
          });

          if (parsed.field === "email") {
            setServerErrors((prev) => ({
              ...prev,
              email: parsed.message,
            }));
          }
          router.invalidate();
          return;
        }

        // Both operations succeeded
        setServerErrors({});
        toast.success(
          "Profil mis à jour ! Vérifie ta boîte email pour confirmer le changement d'email.",
        );
        router.invalidate();
      } else {
        // Only profile update, no email change
        setServerErrors({});
        toast.success("Profil mis à jour !");
        router.invalidate();
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
        <form.AppField name="name">
          {(field) => (
            <field.Input
              label="Nom"
              description="Votre nom complet"
              aria-invalid={!!serverErrors.name}
            />
          )}
        </form.AppField>
        {serverErrors.name && (
          <p className="text-sm text-destructive">{serverErrors.name}</p>
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
              description="Votre adresse email"
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
              onClick={() => form.reset()}
              disabled={isSubmitting || !isDirty}
            >
              Annuler
            </Button>
            <ActionButton
              isPending={isSubmitting}
              disabled={!canSubmit || isSubmitting}
            >
              Mettre à jour
            </ActionButton>
          </Field>
        )}
      </form.Subscribe>
    </form>
  );
};
