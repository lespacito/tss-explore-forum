import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { ThreadCard } from "@/features/threads/components/thread-card";
import { getThreadsCached } from "@/features/threads/server/actions/get-threads";
export const Route = createFileRoute("/threads/")({
 component: ThreadsPage, loader: () => getThreadsCached(),
 validateSearch: () => ({ openDialog: false }),
});
function ThreadsPage() {
 const threads = Route.useLoaderData();
 return <div className="mx-auto max-w-4xl space-y-8 px-4 py-8"><header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h1 className="font-serif text-3xl font-semibold">Publications de la bêta</h1><p className="mt-2 max-w-prose text-muted-foreground">Scénarios fictifs relus par le modérateur. Les réponses et commentaires sont fermés.</p></div><AnonymousPostButton /></header><Button asChild variant="outline"><Link to="/account/profile">Suivre mes publications</Link></Button><div className="space-y-4">{threads.map(thread => <ThreadCard key={thread.id} thread={thread}/>)}{threads.length === 0 && <div className="border-y py-10"><h2 className="font-medium">Aucune publication validée pour le moment</h2><p className="mt-2 text-muted-foreground">Un message envoyé reste dans Mes publications jusqu’à la décision du modérateur.</p></div>}</div></div>;
}
