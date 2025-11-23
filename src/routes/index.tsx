import { createFileRoute, Link } from "@tanstack/react-router";
import { signOut, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getSessionFn } from "@/actions/auth/get-session";

export const Route = createFileRoute("/")({
  component: App,
  loader: async () => {
    const auth = await getSessionFn();
    return { auth };
  },
});

function App() {
  const { auth } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-10 border-b border-border mb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary" />
            TSS Explore Forum
          </h1>
          {auth.isAuthenticated && <Button onClick={() => signOut()}>Sign out</Button>}
          {!auth.isAuthenticated && (
            <>
              <Button onClick={() => signIn.social({ provider: "github" })}>
                Sign In with GitHub
              </Button>
              <Button asChild>
                <Link to="/auth/login"> Login</Link>
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4">
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to TSS Explore Forum
          </h2>
          {auth.user && <p>Client Signed in as {auth.user.name}</p>}
        </section>
      </main>
    </div>
  );
}
