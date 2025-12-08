import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/lib/auth-client";
import { getAuthSession } from "@/features/auth/server/get-auth-session";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	pendingComponent: () => (
		<Loader2 className="animate-spin h-5 w-5 text-muted-foreground " />
	),
	loader: async () => {
		const session = await getAuthSession();
		if (!session?.user) {
			throw redirect({
				to: "/auth/login",
			});
		}
		return { user: session.user };
	},
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { user } = Route.useLoaderData();
	return (
		<div>
			<h1 className="text-2xl font-bold">Dashboard {user?.username}</h1>
			<Button
				onClick={() => signOut({}, { onSuccess: () => navigate({ to: "/" }) })}
			>
				Sign out
			</Button>
		</div>
	);
}
