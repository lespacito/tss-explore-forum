import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SetPasswordButton } from "@/features/profiles/components/set-password-button";
import { ChangePasswordForm } from "@/features/profiles/components/change-password-form";
export const SecurityTab = ({ email, accounts }: { email: string; accounts: any }) => {
  const hasPasswordAccount = accounts.some(
    (a: any) => a.providerId === "credential",
  );
  return (
    <div className="space-y-6">
      {hasPasswordAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>Changer ton mot de passe</CardTitle>
            <CardDescription>
              Tu peux changer ton mot de passe pour améliorer la sécurité de ton
              compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un mot de passe</CardTitle>
            <CardDescription>
              Nous vous enverrons un lien de réinitialitation pour créer un mot
              de passe pour votre compte associé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetPasswordButton email={email} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
