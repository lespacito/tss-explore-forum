import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecretCodeLoginForm } from "@/features/auth/components/SecretCodeLoginForm";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";

export const Route = createFileRoute("/auth/anonymous-signin")({
	component: RouteComponent,
	loader: async () => {
		const session = await getAuthSessionCached();
		// Si l'utilisateur est déjà connecté, rediriger vers /posts
		if (session?.user) {
			throw redirect({
				to: "/posts",
			});
		}
		return {
			authSession: session,
		};
	},
});

function RouteComponent() {
	return (
		<div className="w-full mx-auto max-w-2xl my-6 px-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Connexion avec code secret
					</CardTitle>
					<p className="text-muted-foreground mt-2">
						Reconnectez-vous avec le code secret reçu lors de votre première
						publication anonyme.
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<Alert>
						<Info className="h-4 w-4" />
						<AlertDescription>
							Votre code secret vous permet de retrouver vos publications
							anonymes sur n'importe quel appareil. Il a été généré
							automatiquement lors de votre première publication.
						</AlertDescription>
					</Alert>

					<SecretCodeLoginForm />

					<div className="border-t pt-6 space-y-4">
						<div className="text-sm text-muted-foreground">
							<p className="font-medium mb-2">Où trouver mon code secret ?</p>
							<ul className="list-disc list-inside space-y-1 ml-2">
								<li>
									Il vous a été affiché après votre première publication anonyme
								</li>
								<li>Vérifiez vos notes ou captures d'écran</li>
								<li>Le code est au format : XXXX-XXXX ou XXXX-XXXX-XXXX</li>
							</ul>
						</div>

						<div className="flex flex-col gap-2">
							<p className="text-sm text-muted-foreground">
								Vous n'avez pas encore publié anonymement ?
							</p>
							<Button variant="outline" asChild>
								<Link to="/threads">Créer ma première publication anonyme</Link>
							</Button>
						</div>

						<div className="text-sm text-muted-foreground">
							<p>Vous avez un compte avec email ?</p>
							<Button variant="link" className="px-0" asChild>
								<Link to="/auth/login">Se connecter avec email</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
