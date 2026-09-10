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
		<main className="mx-auto w-full max-w-lg space-y-8 px-4 py-12 sm:py-16">
			<header className="space-y-3">
				<h1 className="font-serif text-3xl font-semibold tracking-tight text-balance">
					Connexion avec code secret
				</h1>
				<p className="text-muted-foreground">
					Saisissez le code reçu après votre première publication pour retrouver
					vos publications.
				</p>
			</header>

			<SecretCodeLoginForm />

			<details className="border-t pt-5 text-sm">
				<summary className="cursor-pointer font-medium underline-offset-4 hover:underline">
					Où trouver mon code ?
				</summary>
				<p className="mt-3 text-muted-foreground">
					Il a été affiché après votre première publication. Vérifiez vos notes
					ou captures d’écran.
				</p>
			</details>

			<nav
				aria-label="Autres options de connexion"
				className="flex flex-col gap-3 border-t pt-5 text-sm"
			>
				<Link
					to="/threads"
					search={{ openDialog: false }}
					className="font-medium underline underline-offset-4"
				>
					Créer une première publication
				</Link>
				<Link
					to="/auth/login"
					className="text-muted-foreground underline underline-offset-4"
				>
					Se connecter avec un e-mail
				</Link>
			</nav>
		</main>
	);
}
