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
      const promises = [
        authClient.updateUser({
          name: value.name,
          displayUsername: value.displayUsername,
        }),
      ];
      if (value.email !== user.email) {
        promises.push(
          authClient.changeEmail({
            newEmail: value.email,
            callbackURL: "/account/profile",
          }),
        );
      }
      const res = await Promise.all(promises);

      const updateUserResult = res[0];
      const emailResult = res[1] ?? { error: false };

      if (updateUserResult.error) {
        // Parse l'erreur pour identifier le champ concerné
        const parsed = parseProfileUpdateError(updateUserResult.error);

        toast.error(
          parsed.message ||
            updateUserResult.error.message ||
            "Impossible de mettre à jour ton profil",
        );

        // Logger l'erreur pour le debug
        logger.error("Erreur durant la mise à jour du profil", {
          message: updateUserResult.error.message,
          parsedField: parsed.field,
        });

        // Mapper l'erreur vers le champ spécifique si identifié
        if (
          parsed.field &&
          (parsed.field === "name" || parsed.field === "displayUsername")
        ) {
          setServerErrors((prev) => ({
            ...prev,
            [parsed.field as keyof ProfileUpdateFormSchema]: parsed.message,
          }));
        }
      } else if (emailResult.error) {
        // Parse l'erreur email
        const parsed = parseProfileUpdateError(emailResult.error);

        toast.error(
          parsed.message ||
            emailResult.error.message ||
            "Impossible de changer ton email",
        );

        // Logger l'erreur pour le debug
        logger.error("Erreur durant le changement d'email", {
          message: emailResult.error.message,
          parsedField: parsed.field,
        });

        // Mapper l'erreur vers le champ email si identifié
        if (parsed.field === "email") {
          setServerErrors((prev) => ({
            ...prev,
            email: parsed.message,
          }));
        }
      } else {
        // Clear server errors on success
        setServerErrors({});

        if (value.email !== user.email) {
          toast.success(
            "Profil mis à jour ! Vérifie ta boîte email pour confirmer le changement d'email.",
          );
        } else {
          toast.success("Profil mis à jour !");
        }
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
