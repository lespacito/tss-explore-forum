import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
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
	const { user } = Route.useLoaderData();
	return (
		<div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
			<Link to="/account/profile" className="underline underline-offset-4">
				Retour à mes scénarios
			</Link>
			<h1 className="font-serif text-3xl font-semibold tracking-tight">
				Gérer mes données
			</h1>
			<h2 className="font-serif text-2xl font-semibold">Effacer mes données</h2>
			<EraseAccountForm anonymous={user.isAnonymous} userId={user.id} />
		</div>
	);
}
