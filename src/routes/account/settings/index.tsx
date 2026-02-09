import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	Fingerprint,
	Key,
	LinkIcon,
	Mail,
	Shield,
	Trash2,
	User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { AccountDeletion } from "@/features/profiles/components/account-deletion";
import { LinkedAccountsTab } from "@/features/profiles/components/linked-accounts-tab";
import { LoadingSuspense } from "@/features/profiles/components/loading-suspense";
import { ProfileUpdateForm } from "@/features/profiles/components/profile-update-form";
import { SecurityTab } from "@/features/profiles/components/security-tab";
import { SessionsTab } from "@/features/profiles/components/sessions-tab";
import { getUserAccounts } from "@/features/profiles/server/get-user-accounts";
import { getUserSessions } from "@/features/profiles/server/get-user-sessions";
import { getInitials } from "@/lib/utils/string-utils";

export const Route = createFileRoute("/account/settings/")({
	component: SettingsPage,
	loader: async () => {
		const session = await getAuthSessionCached();
		if (!session || !session.user) {
			throw redirect({
				to: "/auth/login",
				search: { redirect: "/account/settings" },
			});
		}
		const accounts = await getUserAccounts();
		const sessions = await getUserSessions();
		return { user: session.user, accounts, sessions, session };
	},
});

function SettingsPage() {
	const { user, accounts, sessions, session } = Route.useLoaderData();
	const displayName = user.name ?? user.username ?? "Utilisateur";
	const email = user.email ?? "Email non disponible";
	const avatarSrc = user.image ?? "";

	return (
		<div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Paramètres du compte
				</h1>
				<p className="text-muted-foreground">
					Gérez vos informations personnelles et vos paramètres de sécurité.
				</p>
			</div>

			<div className="grid gap-6">
				<div className="space-y-6">
					<Card>
						<CardHeader className="flex-row items-center justify-between">
							<div className="space-y-1">
								<CardTitle>Informations Personnelles</CardTitle>
								<CardDescription>
									Vos informations d'identification sur le forum.
								</CardDescription>
							</div>
							<Button asChild variant="outline">
								<Link to="/account/profile">Voir le profil public</Link>
							</Button>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center gap-6">
								<Avatar className="h-20 w-20">
									<AvatarImage src={avatarSrc} alt={displayName} />
									<AvatarFallback className="text-lg">
										{getInitials(displayName)}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-1">
									<h3 className="font-medium text-xl">{displayName}</h3>
									<p className="text-sm text-muted-foreground flex items-center gap-2">
										<Mail className="h-4 w-4" />
										{email}
									</p>
								</div>
							</div>

							<Separator />

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<User className="h-4 w-4" />
										Nom d'affichage
									</div>
									<p className="font-medium">
										{user.displayUsername || "Non défini"}
									</p>
								</div>
								<div className="space-y-1">
									<div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
										<Fingerprint className="h-4 w-4" />
										Identifiant Unique
									</div>
									<p className="font-mono text-xs bg-muted p-1 rounded w-fit">
										{user.id}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Tabs className="space-y-4" defaultValue="profile">
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="profile" className="gap-2">
								<User className="h-4 w-4" />
								<span className="hidden sm:inline">Profil</span>
							</TabsTrigger>
							<TabsTrigger value="security" className="gap-2">
								<Shield className="h-4 w-4" />
								<span className="hidden sm:inline">Sécurité</span>
							</TabsTrigger>
							<TabsTrigger value="sessions" className="gap-2">
								<Key className="h-4 w-4" />
								<span className="hidden sm:inline">Sessions</span>
							</TabsTrigger>
							<TabsTrigger value="accounts" className="gap-2">
								<LinkIcon className="h-4 w-4" />
								<span className="hidden sm:inline">Comptes liés</span>
							</TabsTrigger>
							<TabsTrigger value="danger" className="gap-2">
								<Trash2 className="h-4 w-4" />
								<span className="hidden sm:inline">Danger</span>
							</TabsTrigger>
						</TabsList>
						<TabsContent value="profile">
							<Card>
								<CardHeader>
									<CardTitle>Modifier le profil</CardTitle>
									<CardDescription>
										Mettez à jour vos informations personnelles.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ProfileUpdateForm user={user} />
								</CardContent>
							</Card>
						</TabsContent>
						<TabsContent value="security">
							<LoadingSuspense>
								<SecurityTab email={user.email} accounts={accounts} />
							</LoadingSuspense>
						</TabsContent>
						<TabsContent value="sessions">
							<LoadingSuspense>
								<SessionsTab
									sessions={sessions}
									currentSessionToken={session?.session?.token ?? ""}
								/>
							</LoadingSuspense>
						</TabsContent>
						<TabsContent value="accounts">
							<LoadingSuspense>
								<LinkedAccountsTab accounts={accounts} />
							</LoadingSuspense>
						</TabsContent>
						<TabsContent value="danger">
							<Card className="border-destructive">
								<CardHeader>
									<CardTitle className="text-destructive">
										Zone de danger
									</CardTitle>
									<CardDescription>
										Actions irréversibles sur votre compte.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<AccountDeletion />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
