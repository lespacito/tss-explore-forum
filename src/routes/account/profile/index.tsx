import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Key,
  LogOut,
  Smartphone,
  Fingerprint,
  LinkIcon,
} from "lucide-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { signOut } from "@/features/auth/lib/auth-client";
import { BetterAuthActionButton } from "@/features/auth/components/better-auth-action-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileUpdateForm } from "@/features/profiles/components/profile-update-form";

const getInitials = (name?: string) => {
  const safe = (name ?? "").trim();
  if (!safe) return "??";
  return safe
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const Route = createFileRoute("/account/profile/")({
  component: ProfilePage,
  loader: async () => {
    const session = await getAuthSession();
    if (!session || !session.user) {
      throw redirect({
        to: "/auth/login",
      });
    }
    return { user: session.user };
  },
});

function ProfilePage() {
  const navigate = Route.useNavigate();
  const { user } = Route.useLoaderData();
  const displayName = user.name ?? user.username ?? "Utilisateur";
  const email = user.email ?? "Email non disponible";
  const avatarSrc = user.image ?? "";

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos paramètres de sécurité.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
              <CardDescription>
                Vos informations d'identification sur le forum.
              </CardDescription>
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
                  <p className="font-medium">{user.displayUsername}</p>
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

          <Tabs className="space-y-2" defaultValue="profile">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">
                <User />
                <span className="max-sm:hidden">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield />
                <span className="max-sm:hidden">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Key />
                <span className="max-sm:hidden">Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="accounts">
                <LinkIcon />
                <span className="max-sm:hidden">Comptes liés</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardContent>
                  <ProfileUpdateForm user={user} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles ou sensibles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BetterAuthActionButton
                variant="destructive"
                size="lg"
                action={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        navigate({ to: "/" });
                      },
                    },
                  })
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </BetterAuthActionButton>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
