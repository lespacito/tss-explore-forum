import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { EraseAccountForm } from "@/features/beta/components/erase-account-form";

export const Route = createFileRoute("/account/settings/")({
	component: Settings,
	loader: async () => {
		const session = await getAuthSessionCached();
		if (!session.user) throw redirect({ to: "/auth/anonymous-signin" });
		return { user: session.user };
	},
});

function Settings() {
	const real = useBetaPresentation().publicationMode === "real";
	const { user } = Route.useLoaderData();
	return (
		<div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
			<Link to="/account/profile" className="underline underline-offset-4">
				{real ? "Retour à mes témoignages" : "Retour à mes situations fictives"}
			</Link>
			<h1 className="font-serif text-3xl font-semibold tracking-tight">
				Gérer mes données
			</h1>
			<h2 className="font-serif text-2xl font-semibold">Effacer mes données</h2>
			<EraseAccountForm anonymous={user.isAnonymous} userId={user.id} />
		</div>
	);
}
