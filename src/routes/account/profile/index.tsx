import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/actions/auth/get-session";

export const Route = createFileRoute("/account/profile/")({
  component: ProfilePage,
  loader: async () => {
    const { user, isAuthenticated } = await getSessionFn();
    if (!isAuthenticated || !user) {
      throw redirect({
        to: "/auth/login",
      });
    }
    return { user };
  },
});

function ProfilePage() {
  const navigate = Route.useNavigate();
  const { user } = Route.useLoaderData();
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <Button
          variant="outline"
          onClick={() => signOut({
            fetchOptions: {
              onSuccess: () => navigate({ to: "/" })
            }
          })}
        >
          Se déconnecter
        </Button>
      </div>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Nom</label>
          <p className="text-lg">{user.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">ID</label>
          <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
        </div>
      </div>
    </div>
  );
}
