import { useId, useState, useCallback } from "react";
import {
  profileUpdateSchema,
  type ProfileUpdateFormSchema,
} from "@/features/profiles/schemas/profile-update-form-schema";
import { useAppForm } from "@/components/form/hooks";
import { Field, FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/ui/action-button";
import { authClient } from "@/features/auth/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { parseProfileUpdateError } from "@/features/auth/lib/client/parse-auth-error";
import { logger } from "@/lib/logger";
import type { User } from "@/features/auth/lib/map-auth-user";

type FormErrors = Partial<Record<keyof ProfileUpdateFormSchema, string>>;

/**
 * Met à jour le profil utilisateur (nom et displayUsername)
 */
async function updateUserProfile(
  name: string,
  displayUsername: string | undefined,
): Promise<{ success: boolean; errors?: FormErrors }> {
  try {
    const result = await authClient.updateUser({
      name,
      // Convertir chaîne vide en undefined pour que better-auth supprime la valeur
      displayUsername: displayUsername?.trim() ? displayUsername : undefined,
    });

    if (result && "error" in result && result.error) {
      const parsed = parseProfileUpdateError(result.error);
      const errors: FormErrors = {};

      if (
        parsed.field &&
        (parsed.field === "name" || parsed.field === "displayUsername")
      ) {
        errors[parsed.field] = parsed.message;
      }

      logger.error("Erreur durant la mise à jour du profil", {
        parsedMessage: parsed.message,
        parsedField: parsed.field,
      });

      const errorMessage =
        parsed.message || "Impossible de mettre à jour ton profil";
      toast.error(errorMessage);

      return { success: false, errors };
    }

    return { success: true };
  } catch (error) {
    logger.error("Exception during user profile update", {
      error: error instanceof Error ? error.message : String(error),
    });
    toast.error(
      "Une erreur inattendue s'est produite lors de la mise à jour du profil",
    );
    return { success: false };
  }
}

/**
 * Change l'email de l'utilisateur
 */
async function changeUserEmail(newEmail: string): Promise<{
  success: boolean;
  errors?: FormErrors;
}> {
  try {
    const result = await authClient.changeEmail({
      newEmail,
      callbackURL: "/account/settings",
    });

    if (result && "error" in result && result.error) {
      const parsed = parseProfileUpdateError(result.error);
      const errors: FormErrors = {};

      if (parsed.field === "email") {
        errors.email = parsed.message;
      }

      logger.error("Erreur durant le changement d'email", {
        parsedMessage: parsed.message,
        parsedField: parsed.field,
      });

      return { success: false, errors };
    }

    return { success: true };
  } catch (error) {
    logger.error("Exception during email change", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false };
  }
}

export const ProfileUpdateForm = ({
  user,
}: {
  user: Pick<User, "name" | "email" | "displayUsername">;
}) => {
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const id = useId();
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: user.name,
      displayUsername: user.displayUsername || undefined,
      email: user.email,
    } as ProfileUpdateFormSchema,
    validators: {
      onSubmit: profileUpdateSchema,
      onBlur: profileUpdateSchema,
    },
    onSubmit: useCallback(
      async ({ value }: { value: ProfileUpdateFormSchema }) => {
        setServerErrors({});

        // Step 1: Update user profile
        const profileResult = await updateUserProfile(
          value.name,
          value.displayUsername,
        );

        if (!profileResult.success) {
          if (profileResult.errors) {
            setServerErrors(profileResult.errors);
          }
          return;
        }

        // Step 2: Change email if needed
        const emailChanged = value.email !== user.email;
        if (emailChanged) {
          const emailResult = await changeUserEmail(value.email);

          if (!emailResult.success) {
            if (emailResult.errors) {
              setServerErrors(emailResult.errors);
            }
            toast.warning(
              "Profil mis à jour, mais impossible de changer l'email. Réessaye plus tard.",
            );
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
      [user.email, router],
    ),
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
