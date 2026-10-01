import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Button } from "@/components/ui/button";
import { getThreadBySlugFn } from "@/features/threads/server/actions/get-thread-by-slug";
export const Route = createFileRoute("/threads/$threadSlug")({
	component: Thread,
	loader: ({ params }) =>
		getThreadBySlugFn({ data: { slug: params.threadSlug } }),
});
function Thread() {
	const thread = Route.useLoaderData();
	return <ThreadContent key={thread.id} thread={thread} />;
}
function ThreadContent({
	thread,
}: {
	thread: Awaited<ReturnType<typeof getThreadBySlugFn>>;
}) {
	const [revealed, setRevealed] = useState(false);
	return (
		<article className="mx-auto max-w-3xl space-y-6 px-4 py-10">
			<Link to="/threads" search={{ openDialog: false }} className="underline">
				Retour aux situations fictives
			</Link>
			<p className="text-sm text-muted-foreground">
				Auteur anonyme · Situation fictive de bêta
			</p>
			<h1 className="break-words font-serif text-3xl font-semibold">
				{thread.title}
			</h1>
			{thread.isSensitive && !revealed ? (
				<section className="space-y-4 rounded-xl border p-5">
					<h2 className="font-semibold">
						Cette situation fictive contient un contenu sensible
					</h2>
					<p>Vous pouvez revenir à la liste ou choisir de lire cette situation fictive.</p>
					<Button onClick={() => setRevealed(true)}>
						Afficher la situation fictive
					</Button>
				</section>
			) : (
				<>
					<SafeHtmlDisplay html={thread.body} className="break-words" />
					{thread.isSensitive && (
						<Button variant="outline" onClick={() => setRevealed(false)}>
							Masquer à nouveau
						</Button>
					)}
				</>
			)}
			<p className="border-t pt-5 text-sm text-muted-foreground">
				Les réponses et commentaires sont fermés pendant cette bêta.
			</p>
		</article>
	);
}
