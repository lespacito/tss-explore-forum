import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { auth } from "@/features/auth/lib/auth";
import { AccountLinking } from "@/features/profiles/components/account-linking";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export const LinkedAccountsTab = ({ accounts }: { accounts: Account[] }) => {
  const nonCredentialsAccounts = accounts.filter(
    (a) => a.providerId !== "credential",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comptes liés</CardTitle>
        <CardDescription>
          Gérez vos comptes de connexion liés à votre profil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AccountLinking currentAccounts={nonCredentialsAccounts} />
      </CardContent>
    </Card>
  );
};
