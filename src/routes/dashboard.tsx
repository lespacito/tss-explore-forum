import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Button
        onClick={() => signOut({}, { onSuccess: () => navigate({ to: "/" }) })}
      >
        Sign out
      </Button>
    </div>
  );
}
