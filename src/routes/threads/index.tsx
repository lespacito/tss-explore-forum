import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	parseThreadCategory,
	type ThreadCategory,
} from "@/data/threads-categories";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { ThreadCard } from "@/features/threads/components/thread-card";
import { getThreadsCached } from "@/features/threads/server/actions/get-threads";
export const Route = createFileRoute("/threads/")({
	component: ThreadsPage,
	loader: () => getThreadsCached(),
	validateSearch: (
		search: Record<string, unknown>,
	): { category?: ThreadCategory; openDialog?: boolean } => ({
		openDialog: false,
		category: parseThreadCategory(search.category),
	}),
});
function ThreadsPage() {
	const threads = Route.useLoaderData();
	return (
		<div className="civic-page mx-auto max-w-4xl space-y-8 px-4 py-8">
			<header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<h1 className="font-serif text-3xl font-semibold">
						Scénarios publics
					</h1>
					<p className="mt-2 max-w-prose text-muted-foreground">
						Scénarios fictifs relus par le modérateur. Les réponses et
						commentaires sont fermés.
					</p>
				</div>
				<AnonymousPostButton />
			</header>
			<Button asChild variant="outline">
				<Link to="/account/profile">Suivre mes scénarios</Link>
			</Button>
			<div className="space-y-4">
				{threads.map((thread) => (
					<ThreadCard key={thread.id} thread={thread} />
				))}
				{threads.length === 0 && (
					<div className="border-y py-10">
						<h2 className="font-medium">
							Aucun scénario publié pour le moment
						</h2>
						<p className="mt-2 text-muted-foreground">
							Un scénario envoyé reste dans Mes scénarios jusqu’à la décision du
							modérateur.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
