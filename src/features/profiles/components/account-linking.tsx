import { useRouter } from "@tanstack/react-router";
import { Plus, Shield, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import type { auth } from "@/features/auth/lib/auth";
import { authClient } from "@/features/auth/lib/auth-client";
import {
	SUPPORTED_OAUTH_PROVIDER_DETAILS,
	SUPPORTED_OAUTH_PROVIDERS,
	type SupportedOAuthProvider,
} from "@/features/auth/lib/o-auth-providers";

type Account = Awaited<ReturnType<typeof auth.api.listUserAccounts>>[number];

export const AccountLinking = ({
	currentAccounts,
}: {
	currentAccounts: Account[];
}) => {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Comptes liés</h3>
				{currentAccounts.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-secondary-muted">
							Aucun compte lié pour le moment
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{currentAccounts.map((account) => (
							<AccountCard
								key={account.id}
								provider={account.providerId}
								account={account}
							/>
						))}
					</div>
				)}
			</div>
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Lier un autre compte</h3>
				<div className="grid gap-3">
					{SUPPORTED_OAUTH_PROVIDERS.filter(
						(provider) =>
							!currentAccounts.find((acc) => acc.providerId === provider),
					).map((provider) => (
						<AccountCard key={provider} provider={provider} />
					))}
				</div>
			</div>
		</div>
	);
};

const AccountCard = ({
	provider,
	account,
}: {
	provider: string;
	account?: Account;
}) => {
	const router = useRouter();

	const providerDetails = SUPPORTED_OAUTH_PROVIDER_DETAILS[
		provider as SupportedOAuthProvider
	] ?? {
		name: provider,
		icon: Shield,
	};

	function linkAccount() {
		return authClient.linkSocial({
			provider,
			callbackURL: "/account/settings",
		});
	}

	function unlinkAccount() {
		if (account == null) {
			return Promise.resolve({ error: { message: "Compte introuvable" } });
		}
		return authClient.unlinkAccount(
			{
				accountId: account.accountId,
				providerId: provider,
			},
			{
				onSuccess: () => {
					router.invalidate();
				},
			},
		);
	}

	return (
		<Card>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{<providerDetails.Icon className="size-5" />}
						<div>
							<p className="font-medium">{providerDetails.name}</p>
							{account == null ? (
								<p className="text-sm text-muted-foreground">
									Connecter votre compte {providerDetails.name} pour vous
									connecter plus facilement
								</p>
							) : (
								<p className="text-sm text-muted-foreground">
									Lié le
									{new Date(account.createdAt).toLocaleDateString("fr-CH")}
								</p>
							)}
						</div>
					</div>
					{account == null ? (
						<BetterAuthActionButton
							variant="outline"
							size="sm"
							action={linkAccount}
						>
							Lié <Plus />
						</BetterAuthActionButton>
					) : (
						<BetterAuthActionButton
							variant="destructive"
							size="sm"
							action={unlinkAccount}
						>
							Dissocié <Trash2 />
						</BetterAuthActionButton>
					)}
				</div>
			</CardContent>
		</Card>
	);
};
