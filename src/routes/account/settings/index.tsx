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
		<main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
			<Link to="/account/profile" className="underline underline-offset-4">
				Retour à mes publications
			</Link>
			<h1 className="font-serif text-3xl font-semibold tracking-tight">
				Effacer mon compte
			</h1>
			<EraseAccountForm anonymous={user.isAnonymous} />
		</main>
	);
}
