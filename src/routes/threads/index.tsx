import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	parseThreadCategory,
	type ThreadCategory,
} from "@/data/threads-categories";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
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
	const real = useBetaPresentation().publicationMode === "real";
	const threads = Route.useLoaderData();
	return (
		<div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
			<header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<h1 className="font-serif text-3xl font-semibold">
						{real ? "Témoignages publiés" : "Situations fictives publiées"}
					</h1>
					<p className="mt-2 max-w-prose text-muted-foreground">
						{real
							? "Chaque témoignage a été examiné avant sa publication. Les réponses et commentaires sont fermés."
							: "Situations fictives relues par le modérateur. Les réponses et commentaires sont fermés."}
					</p>
				</div>
				<AnonymousPostButton />
			</header>
			<Button asChild variant="outline">
				<Link to="/account/profile">
					{real ? "Suivre mes témoignages" : "Suivre mes situations fictives"}
				</Link>
			</Button>
			<div className="space-y-4">
				{threads.map((thread) => (
					<ThreadCard key={thread.id} thread={thread} />
				))}
				{threads.length === 0 && (
					<div className="border-y py-10">
						<h2 className="font-medium">
							{real
								? "Aucun témoignage publié pour le moment"
								: "Aucune situation fictive publiée pour le moment"}
						</h2>
						<p className="mt-2 text-muted-foreground">
							{real
								? "Un témoignage envoyé reste dans Mes témoignages jusqu’à la décision de la modération."
								: "Une situation fictive envoyée reste dans Mes situations fictives jusqu’à la décision du modérateur."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
