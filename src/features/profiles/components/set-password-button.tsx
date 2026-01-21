import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import { authClient } from "@/features/auth/lib/auth-client";

export const SetPasswordButton = ({ email }: { email: string }) => {
  return (
    <BetterAuthActionButton
      variant="outline"
      successMessage={`Mail de réinitilaition envoyé à ${email}`}
      action={() => {
        return authClient.requestPasswordReset({
          email,
          redirectTo: "/auth/reset-password",
        });
      }}
    >
      Envoyer le lien de réinitialisation de mot de passe
    </BetterAuthActionButton>
  );
};
