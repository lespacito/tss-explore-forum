import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	AtSign,
	Calendar,
	Clock,
	FileText,
	MessageSquare,
	Settings,
} from "lucide-react";
import { useState } from "react";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { PostCard } from "@/features/posts/components/post-card";
import { getUserPostsFn } from "@/features/posts/server/actions/get-user-posts";
import { RejectionMessage } from "@/features/profiles/components/RejectionMessage";
import { ThreadStatusBadge } from "@/features/profiles/components/ThreadStatusBadge";
import { getUserThreadsFn } from "@/features/threads/server/actions/get-user-threads";
import { logger } from "@/lib/logger/client-logger";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils/string-utils";
import {
	getAuthorDisplayName,
	getCategoryColor,
} from "@/lib/utils/thread-utils";

type StatusFilter = "all" | "pending" | "published" | "rejected";

export const Route = createFileRoute("/account/profile/")({
	component: PublicProfilePage,
	loader: async () => {
		const session = await getAuthSessionCached();
		if (!session || !session.user) {
			throw redirect({
				to: "/auth/login",
				search: { redirect: "/account/profile" },
			});
		}

		try {
			const [userThreads, userPosts] = await Promise.all([
				getUserThreadsFn({ data: {} }).catch(() => []),
				getUserPostsFn().catch(() => []),
			]);

			return {
				user: session.user,
				threads: userThreads ?? [],
				posts: userPosts ?? [],
			};
		} catch (error) {
			logger.error("Error loading user profile data:", error);
			return {
				user: session.user,
				threads: [],
				posts: [],
			};
		}
	},
});

function PublicProfilePage() {
	const { user, threads, posts } = Route.useLoaderData();
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const displayName = user?.name ?? user?.username ?? "Utilisateur";
	const avatarSrc = user?.image ?? "";
	const joinDate = user?.createdAt
		? format(new Date(user.createdAt), "d MMMM yyyy", { locale: fr })
		: "Date inconnue";

	const filteredThreads =
		statusFilter === "all"
			? threads
			: threads.filter((t) => t.status === statusFilter);

	const statusCounts = threads.reduce<Record<string, number>>(
		(acc, t) => {
			acc[t.status] = (acc[t.status] ?? 0) + 1;
			return acc;
		},
		{},
	);
	const pendingCount = statusCounts.pending ?? 0;
	const publishedCount = statusCounts.published ?? 0;
	const rejectedCount = statusCounts.rejected ?? 0;

	return (
		<div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
			<Card>
				<CardHeader className="relative">
					<div className="space-y-4">
						<Avatar className="h-28 w-28 border-4 border-background">
							<AvatarImage src={avatarSrc} alt={displayName} />
							<AvatarFallback className="text-3xl">
								{getInitials(displayName)}
							</AvatarFallback>
						</Avatar>
						<div className="space-y-1">
							<h1 className="text-3xl font-bold tracking-tight">
								{displayName}
							</h1>
							<p className="text-muted-foreground flex items-center gap-2">
								<AtSign className="h-4 w-4" />
								{user.username ?? "non-défini"}
							</p>
						</div>
					</div>
					<Button
						asChild
						variant="outline"
						className="absolute top-6 right-6 gap-2"
					>
						<Link to="/account/settings">
							<Settings className="h-4 w-4" />
							Gérer le compte
						</Link>
					</Button>
				</CardHeader>
				<CardContent className="space-y-6">
					<Separator />
					<div className="space-y-4">
						<h3 className="font-semibold text-lg">À propos de moi</h3>
						<p className="text-muted-foreground italic">
							{user?.bio || "L'utilisateur n'a pas encore écrit de biographie."}
						</p>
					</div>

					<div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							<span>Rejoint le {joinDate}</span>
						</div>
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4" />
							<span>
								{threads?.length ?? 0}{" "}
								{(threads?.length ?? 0) === 1 ? "publication" : "publications"}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							<span>
								{posts?.length ?? 0}{" "}
								{(posts?.length ?? 0) === 1 ? "réponse" : "réponses"}
							</span>
						</div>
						{pendingCount > 0 && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span>{pendingCount} en attente</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Mes publications et réponses */}
			<Card>
				<CardHeader>
					<CardTitle>Mon activité</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="publications" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="publications" className="gap-2">
								<FileText className="h-4 w-4" />
								Mes publications ({threads?.length ?? 0})
							</TabsTrigger>
							<TabsTrigger value="reponses" className="gap-2">
								<MessageSquare className="h-4 w-4" />
								Mes réponses ({posts?.length ?? 0})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="publications" className="space-y-4 mt-6">
							{/* Status filter using buttons instead of nested Tabs */}
							<fieldset
								className="flex flex-wrap gap-2 border-none p-0 m-0"
								aria-label="Filtrer par statut"
							>
								<StatusFilterButton
									active={statusFilter === "all"}
									onClick={() => setStatusFilter("all")}
									count={threads?.length ?? 0}
								>
									Toutes
								</StatusFilterButton>
								<StatusFilterButton
									active={statusFilter === "pending"}
									onClick={() => setStatusFilter("pending")}
									count={pendingCount}
								>
									En attente
								</StatusFilterButton>
								<StatusFilterButton
									active={statusFilter === "published"}
									onClick={() => setStatusFilter("published")}
									count={publishedCount}
								>
									Publiées
								</StatusFilterButton>
								<StatusFilterButton
									active={statusFilter === "rejected"}
									onClick={() => setStatusFilter("rejected")}
									count={rejectedCount}
								>
									À modifier
								</StatusFilterButton>
							</fieldset>

							{filteredThreads.length === 0 ? (
								<div className="text-center py-10 text-muted-foreground">
									<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
									{threads.length === 0 ? (
										<>
											<p>Vous n'avez pas encore créé de publication.</p>
											<Button asChild className="mt-4" variant="outline">
												<Link to="/threads">Explorer les discussions</Link>
											</Button>
										</>
									) : (
										<p>Aucune publication avec le statut sélectionné.</p>
									)}
								</div>
							) : (
								<div className="space-y-4">
									{filteredThreads.map((thread) => (
										<UserThreadCard key={thread.id} thread={thread} />
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="reponses" className="space-y-4 mt-6">
							{!posts || posts.length === 0 ? (
								<div className="text-center py-10 text-muted-foreground">
									<MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>Vous n'avez pas encore posté de réponse.</p>
									<Button asChild className="mt-4" variant="outline">
										<Link to="/threads">Participer aux discussions</Link>
									</Button>
								</div>
							) : (
								posts.map((post) => (
									<PostCard
										key={post.id}
										post={post}
										threadCategory={post.threadCategory || ""}
									/>
								))
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Status filter button component
 */
function StatusFilterButton({
	active,
	onClick,
	count,
	children,
}: {
	active: boolean;
	onClick: () => void;
	count: number;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
				active
					? "bg-primary text-primary-foreground"
					: "bg-muted text-muted-foreground hover:bg-muted/80",
			)}
		>
			{children} ({count})
		</button>
	);
}

/**
 * Enhanced thread card for the user dashboard that includes status badges
 * and rejection messages. Extends the standard ThreadCard with moderation info.
 */
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
		moderatedAt: string | null;
		createdAt: Date | string;
		updatedAt: Date | string;
		aliasName: string | null;
		aliasId: string | null;
		displayUsername: string | null;
	};
}) {
	const authorName = getAuthorDisplayName({
		isSensitive: thread.isSensitive,
		threadCategory: thread.category,
		aliasName: thread.aliasName,
		displayUsername: thread.displayUsername,
	});

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
