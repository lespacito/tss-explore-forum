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

export const ProfileUpdateForm = ({
  user,
}: {
  user: {
    name: string;
    email: string;
    displayUsername: string | null;
  };
}) => {
  const id = useId();
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<keyof ProfileUpdateFormSchema, string>>
  >({});
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
        toast.error(
          updateUserResult.error.message ||
            "Impossible de mettre à jour ton profil",
        );
      } else if (emailResult.error) {
        toast.error(
          emailResult.error.message || "Impossible de changer ton email",
        );
      } else {
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
