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
} from "lucide-react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/lib/auth-client";

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-medium text-xl">{user.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
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
                  <p className="font-medium">{user.name}</p>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Mot de passe
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dernière modification il y a 3 mois
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Modifier
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Bientôt
                  </Badge>
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="font-medium flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Authentification à deux facteurs
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Activer
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Bientôt
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <Button
                variant="destructive"
                className="w-full cursor-pointer"
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => navigate({ to: "/" }),
                    },
                  })
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
