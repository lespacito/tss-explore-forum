import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link to="/auth/login">Se connecter</Link>
      </Button>
      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link to="/auth/login">Commencer</Link>
      </Button>
    </div>
  );
}
