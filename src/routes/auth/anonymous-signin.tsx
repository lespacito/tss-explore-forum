import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SecretCodeLoginForm } from "@/features/auth/components/SecretCodeLoginForm";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";

export const Route = createFileRoute("/auth/anonymous-signin")({
	component: RouteComponent,
	loader: async () => {
		const session = await getAuthSessionCached();
		// Si l'utilisateur est déjà connecté, rediriger vers /posts
		if (session?.user) {
			throw redirect({
				to: "/threads",
				search: { openDialog: false },
			});
		}
		return {
			authSession: session,
		};
	},
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-lg space-y-8 px-4 py-12 sm:py-16">
			<header className="space-y-3">
				<h1 className="font-serif text-3xl font-semibold tracking-tight text-balance">
					Retrouver ma session
				</h1>
				<p className="text-muted-foreground">
					Saisissez le code de récupération reçu après votre premier scénario.
				</p>
			</header>

			<SecretCodeLoginForm />

			<details className="border-t pt-5 text-sm">
				<summary className="cursor-pointer font-medium underline-offset-4 hover:underline">
					Où trouver mon code ?
				</summary>
				<p className="mt-3 text-muted-foreground">
					Il a été affiché après votre premier scénario. Vérifiez vos notes ou
					captures d’écran.
				</p>
			</details>

			<nav aria-label="Commencer" className="border-t pt-5 text-sm">
				<Link
					to="/threads"
					search={{ openDialog: false }}
					className="font-medium underline underline-offset-4"
				>
					Créer un premier scénario
				</Link>
			</nav>
		</div>
	);
}
