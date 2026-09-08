import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SecretCodeDisplay } from "@/features/auth/components/SecretCodeDisplay";
import { generateSecretCodeFn } from "@/features/auth/server/generate-secret-code-fn";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { RejectionMessage } from "@/features/profiles/components/RejectionMessage";
import { ThreadStatusBadge } from "@/features/profiles/components/ThreadStatusBadge";
import { getUserThreadsFn } from "@/features/threads/server/actions/get-user-threads";
import { getInitials } from "@/lib/utils/string-utils";
import { getCategoryColor } from "@/lib/utils/thread-utils";

export const Route = createFileRoute("/account/profile/")({
 component: Profile,
 loader: async () => { const session = await getAuthSessionCached(); if (!session.user) throw redirect({to: "/auth/anonymous-signin"}); return { user: session.user, threads: await getUserThreadsFn({data: {}}) }; },
});
function Profile() {
 const { user, threads } = Route.useLoaderData();
 const [filter, setFilter] = useState("all");
 const [code, setCode] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const labels = { all: "Toutes", pending: "En attente", published: "Publiées", rejected: "Refusées" };
 return <div className="mx-auto max-w-4xl space-y-6 px-4 py-10"><header className="flex flex-wrap items-center justify-between gap-4"><h1 className="font-serif text-3xl font-semibold">Mes publications</h1><Button asChild variant="outline"><Link to="/account/settings">Gérer le compte</Link></Button></header><p className="text-muted-foreground">Cet espace vous est personnel. Retrouvez ici la décision du modérateur. Un message en attente n’est pas encore visible par les autres invités.</p>{user.isAnonymous && <div className="space-y-4"><Button variant="outline" disabled={loading} onClick={async () => { if(code) {setCode(""); return;} setLoading(true); setError(""); try { const result = await generateSecretCodeFn(); if (result.success) setCode(result.secretCode); else setError(result.error); } catch {setError("Le code n’a pas pu être chargé. Réessayez.");} finally {setLoading(false);} }}>{loading ? "Chargement…" : code ? "Masquer mon code secret" : "Consulter mon code secret"}</Button>{error && <p role="alert">{error}</p>}{code && <SecretCodeDisplay secretCode={code} isExisting/>}</div>}<fieldset aria-label="Filtrer les publications" className="flex flex-wrap gap-2">{Object.entries(labels).map(([value, label]) => <Button type="button" key={value} aria-pressed={filter === value} variant={filter === value ? "default" : "outline"} onClick={() => setFilter(value)}>{label}</Button>)}</fieldset><div className="space-y-4">{threads.filter(t => filter === "all" || t.status === filter).map(t => <UserThreadCard key={t.id} thread={t}/>)}{threads.filter(t => filter === "all" || t.status === filter).length === 0 && <p className="py-6 text-muted-foreground">Aucune publication pour ce filtre.</p>}</div><Button asChild><Link to="/threads/new">Créer une publication</Link></Button></div>;
}
function UserThreadCard({
	thread,
}: {
	thread: {
		id: string;
		title: string;
		body: string;
		slug: string;
		category: string;
		status: "pending" | "published" | "rejected";
		isSensitive: boolean;
		rejectionReason: string | null;
		moderatedAt: Date | string | null;
		createdAt: Date | string;
		updatedAt: Date | string;
		aliasName: string | null;
		aliasId: string | null;
		displayUsername: string | null;
	};
}) {
	const authorName = thread.aliasName || "Anonyme";

	const authorInitials = getInitials(authorName);

	const isPublished = thread.status === "published";

	return (
		<div className="space-y-0">
			{isPublished ? (
				<Link
					to="/threads/$threadSlug"
					params={{ threadSlug: thread.slug }}
					className="block"
				>
					<ThreadCardInner
						thread={thread}
						authorName={authorName}
						authorInitials={authorInitials}
					/>
				</Link>
			) : (
				<ThreadCardInner
					thread={thread}
					authorName={authorName}
					authorInitials={authorInitials}
				/>
			)}

			{thread.status === "rejected" && thread.rejectionReason && (
				<div className="ml-0 -mt-1">
					<RejectionMessage reason={thread.rejectionReason} />
				</div>
			)}
		</div>
	);
}

function ThreadCardInner({
	thread,
	authorName,
	authorInitials,
}: {
	thread: {
		title: string;
		body: string;
		category: string;
		status: "pending" | "published" | "rejected";
		isSensitive: boolean;
		createdAt: Date | string;
	};
	authorName: string;
	authorInitials: string;
}) {
	return (
		<Card className="w-full hover:shadow-md transition-shadow">
			<CardHeader className="flex flex-row items-start gap-4 p-4">
				<Avatar>
					<AvatarFallback className="bg-primary/10 text-primary">
						{authorInitials}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-semibold text-sm">{authorName}</span>
						<Badge
							variant="outline"
							className={`text-xs ${getCategoryColor(thread.category)}`}
						>
							{thread.category}
						</Badge>
						<ThreadStatusBadge status={thread.status} />
					</div>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(thread.createdAt), {
							addSuffix: true,
							locale: fr,
						})}
					</span>
				</div>
			</CardHeader>
			<CardContent className="p-4 pt-0 space-y-2">
				<h3 className="font-bold text-lg font-serif">{thread.title}</h3>
				<SafeHtmlDisplay
					html={thread.body}
					className="text-sm text-muted-foreground line-clamp-3"
				/>
			</CardContent>
		</Card>
	);
}
