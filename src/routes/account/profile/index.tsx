import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	EyeOff,
} from "lucide-react";
import {
	getCategoryConfig,
	type ThreadCategory,
} from "@/data/threads-categories";
import { SecretCodeDisplay } from "@/features/auth/components/SecretCodeDisplay";
import { generateSecretCodeFn } from "@/features/auth/server/generate-secret-code-fn";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { RejectionMessage } from "@/features/profiles/components/RejectionMessage";
import { ThreadStatusBadge } from "@/features/profiles/components/ThreadStatusBadge";
import { getUserThreadsFn } from "@/features/threads/server/actions/get-user-threads";

export const Route = createFileRoute("/account/profile/")({
	component: Profile,
	loader: async () => {
		const session = await getAuthSessionCached();
		if (!session.user) throw redirect({ to: "/auth/anonymous-signin" });
		const threads = await getUserThreadsFn({ data: {} });
		return {
			user: session.user,
			threads,
		};
	},
});

function Profile() {
	const { user, threads } = Route.useLoaderData();
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const totalCount = threads.length;
	const pendingCount = threads.filter((t) => t.status === "pending").length;
	const publishedCount = threads.filter((t) => t.status === "published").length;
	const rejectedCount = threads.filter((t) => t.status === "rejected").length;

	const groups = [
		{
			status: "pending" as const,
			title: "À examiner",
			description:
				"Ces situations fictives sont en attente de décision par le modérateur.",
		},
		{
			status: "rejected" as const,
			title: "Non publiées",
			description:
				"Ces situations fictives n'ont pas été publiées. Le motif est indiqué sous chaque situation fictive.",
		},
		{
			status: "published" as const,
			title: "Publiées",
			description:
				"Ces situations fictives sont visibles par les participants invités.",
		},
	];

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:py-14">
			<header className="border-b pb-7 flex flex-wrap items-end gap-x-4">
				<div>
					<h1 className="font-serif text-4xl font-semibold tracking-tight">
						Mes situations fictives
					</h1>
					<p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
						Toutes vos situations fictives sont regroupées ici, avec leur statut de
						modération.
					</p>
				</div>
				<Link
					to="/account/settings"
					className="ml-auto text-sm text-muted-foreground underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				>
					Gérer mes données
				</Link>
			</header>

			{totalCount > 0 && (
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
					<span className="text-muted-foreground">
						{totalCount} {totalCount > 1 ? "situations fictives" : "situation fictive"} au total
					</span>
					{pendingCount > 0 && (
						<Badge variant="outline" className="bg-warning/10 border-warning/50 text-warning-foreground dark:text-warning">
							{pendingCount} à examiner
						</Badge>
					)}
					{publishedCount > 0 && (
						<Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
							{publishedCount} publiée{publishedCount > 1 ? "s" : ""}
						</Badge>
					)}
					{rejectedCount > 0 && (
						<Badge variant="outline" className="bg-warning/10 border-warning/30 text-warning-foreground dark:text-warning">
							{rejectedCount} non publiée{rejectedCount > 1 ? "s" : ""}
						</Badge>
					)}
				</div>
			)}

			<Card className="border-muted">
				<CardHeader className="pb-4">
					<CardTitle className="font-serif text-xl">Mes situations fictives</CardTitle>
					<CardDescription className="mt-1">
						Toutes vos situations fictives sont regroupées ici, avec leur statut de
						modération.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-3">
						<dt className="text-sm text-muted-foreground">Type de session</dt>
						<Badge variant={user.isAnonymous ? "outline" : "default"}>
							{user.isAnonymous ? "Session sous pseudonyme" : "Compte"}
						</Badge>
					</div>
					<p className="text-sm text-muted-foreground leading-relaxed">
						Si une situation fictive est publiée, elle apparaît sous votre pseudonyme.
						L’administration technique peut relier votre session à ses pseudonymes ;
						le contenu peut aussi permettre de vous reconnaître.
					</p>
				</CardContent>
			</Card>

			{user.isAnonymous && (
				<section className="border-b pb-7">
					<Button
						variant="outline"
						disabled={loading}
						onClick={async () => {
							if (code) {
								setCode("");
								return;
							}
							setLoading(true);
							setError("");
							try {
								const result = await generateSecretCodeFn();
								if (result.success) setCode(result.secretCode);
								else setError(result.error);
							} catch {
								setError("Le code de récupération n’a pas pu être chargé. Réessayez.");
							} finally {
								setLoading(false);
							}
						}}
					>
						{loading
							? "Chargement…"
							: code
								? "Masquer mon code de récupération"
								: "Voir mon code de récupération"}
					</Button>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
					{code && <SecretCodeDisplay secretCode={code} isExisting />}
				</section>
			)}

			{threads.length === 0 ? (
				<Empty className="mx-auto max-w-xl">
					<EmptyHeader className="text-center">
						<EmptyMedia variant="icon">
							<EyeOff className="size-6 text-muted-foreground" />
						</EmptyMedia>
						<EmptyTitle className="font-serif text-xl font-semibold">
							Aucune situation fictive
						</EmptyTitle>
						<EmptyDescription className="text-sm text-muted-foreground">
							Votre première situation fictive apparaîtra ici après son envoi.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent className="pt-4">
						<Button asChild size="lg">
							<Link to="/threads/new">Créer une nouvelle situation fictive</Link>
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="space-y-8 sm:space-y-10">
					{groups.map((group, groupIndex) => {
						const groupThreads = threads.filter(
							(thread) => thread.status === group.status,
						);
						return (
							<section
								key={group.status}
								aria-labelledby={`group-${group.status}`}
							>
								<div className="mb-5">
									<div className="flex items-baseline gap-3">
										<h2
											id={`group-${group.status}`}
											className="font-serif text-2xl font-semibold tracking-tight"
										>
											{group.title}
										</h2>
										<span className="text-sm tabular-nums text-muted-foreground">
											{groupThreads.length}
										</span>
									</div>
									<p className="mt-1 text-sm text-muted-foreground">
										{group.description}
									</p>
								</div>
								{groupThreads.length ? (
									<div className="divide-y border-y my-6 sm:my-8">
										{groupThreads.map((thread) => (
											<UserThreadRow key={thread.id} thread={thread} />
										))}
									</div>
								) : (
									<p className="py-6 text-sm text-muted-foreground">
										{group.status === "pending"
											? "Aucune situation fictive à examiner."
											: group.status === "published"
												? "Aucune situation fictive publiée."
												: "Aucune situation fictive non publiée."}
									</p>
								)}
								{groupIndex < groups.length - 1 && (
									<div className="my-8 border-t border-border/50" />
								)}
							</section>
						);
					})}
				</div>
			)}

		</div>
	);
}

type UserThread = {
	id: string;
	title: string;
	body: string;
	slug: string;
	category: string | null;
	status: "pending" | "published" | "rejected";
	isSensitive: boolean;
	rejectionReason: string | null;
	createdAt: Date | string;
};

function UserThreadRow({ thread }: { thread: UserThread }) {
	const content = (
		<article className="py-6">
			<div className="flex flex-wrap items-center gap-2">
				<ThreadStatusBadge status={thread.status} />
				<Badge variant="outline">
					{thread.category
						? getCategoryConfig(thread.category as ThreadCategory)?.label ??
							thread.category
						: "Non classé"}
				</Badge>
				<time className="text-xs text-muted-foreground">
					{formatDistanceToNow(new Date(thread.createdAt), {
						addSuffix: true,
						locale: fr,
					})}
				</time>
			</div>
			<h3 className="mt-3 font-serif text-xl font-semibold">{thread.title}</h3>
			<SafeHtmlDisplay
				html={thread.body}
				className="mt-2 line-clamp-3 max-w-[70ch] text-sm leading-6 text-muted-foreground"
			/>
		</article>
	);

	return (
		<div>
			{thread.status === "published" ? (
				<Link
					to="/threads/$threadSlug"
					params={{ threadSlug: thread.slug }}
					className="block hover:bg-secondary/35"
				>
					{content}
				</Link>
			) : (
				content
			)}
			{thread.status === "rejected" && thread.rejectionReason && (
				<div className="pb-6">
					<RejectionMessage reason={thread.rejectionReason} />
					<Button asChild variant="outline" className="mt-3">
						<Link to="/threads/new">Créer une nouvelle situation fictive</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
