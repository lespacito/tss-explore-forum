import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger/client-logger";
import { SafeHtmlDisplay } from "@/components/tiptap/SafeHtmlDisplay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/features/posts/components/post-card";
import { createPostFn } from "@/features/posts/server/actions/create-post";
import { getPostsByThreadFn } from "@/features/posts/server/actions/get-posts-by-thread";
import { getThreadBySlugFn } from "@/features/threads/server/actions/get-thread-by-slug";
import { getInitials } from "@/lib/utils/string-utils";
import {
	getAuthorDisplayName,
	isThreadCategorySensitive,
} from "@/lib/utils/thread-utils";

export const Route = createFileRoute("/threads/$threadSlug")({
	loader: async ({ params }) => {
		const thread = await getThreadBySlugFn({
			data: { slug: params.threadSlug },
		});
		const posts = await getPostsByThreadFn({ data: { threadId: thread.id } });
		return { thread, posts };
	},
	head: ({ loaderData }) => {
		const thread = loaderData?.thread;
		if (!thread) return {};
		const description = thread.body
			.replace(/<[^>]+>/g, "")
			.slice(0, 155)
			.trim();
		const url = `https://parlonsviolence.ch/threads/${thread.slug}`;
		const title = `${thread.title} — Parlons Violence`;
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: thread.title },
				{ property: "og:description", content: description },
				{ property: "og:url", content: url },
				{ property: "og:type", content: "article" },
				{ name: "twitter:card", content: "summary" },
				{ name: "twitter:title", content: thread.title },
				{ name: "twitter:description", content: description },
			],
			links: [{ rel: "canonical", href: url }],
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "DiscussionForumPosting",
						headline: thread.title,
						description,
						url,
						datePublished: thread.createdAt,
						inLanguage: "fr-CH",
						isPartOf: {
							"@type": "WebSite",
							name: "Parlons Violence",
							url: "https://parlonsviolence.ch",
						},
					}),
				},
			],
		};
	},
	component: ThreadDetailPage,
});

function ThreadDetailPage() {
	const { thread, posts } = Route.useLoaderData();
	const router = useRouter();

	// Vérifier si la catégorie du thread est sensible
	const isThreadSensitive = isThreadCategorySensitive(thread.category);

	const form = useForm({
		defaultValues: {
			content: "",
			isSensitive: isThreadSensitive, // Force true si catégorie sensible
			contentWarnings: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await createPostFn({
					data: {
						threadId: thread.id,
						content: value.content,
						// Force isSensitive à true si la catégorie du thread est sensible
						isSensitive: isThreadSensitive || value.isSensitive,
						contentWarnings: value.contentWarnings
							? value.contentWarnings.split(",").map((w) => w.trim())
							: [],
					},
				});
				toast.success("Réponse publiée avec succès");
				form.reset();
				router.invalidate();
			} catch (error) {
				logger.error("Failed to create post:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "Erreur lors de la publication",
				);
			}
		},
	});

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			support: "bg-primary/10 text-primary border-primary/20",
			discussion: "bg-chart-2/10 text-chart-2 border-chart-2/20",
			question: "bg-chart-3/10 text-chart-3 border-chart-3/20",
			partage: "bg-accent/10 text-accent-foreground border-accent/20",
			temoignage: "bg-chart-4/10 text-chart-4 border-chart-4/20",
			urgent: "bg-destructive/10 text-destructive border-destructive/20",
		};
		return (
			colors[category.toLowerCase()] ||
			"bg-muted/10 text-muted-foreground border-muted/20"
		);
	};

	const threadAuthorName = getAuthorDisplayName({
		isSensitive: false,
		threadCategory: thread.category,
		aliasName: thread.aliasName,
		displayUsername: thread.displayUsername,
	});

	return (
		<div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
			{/* Header avec retour */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/threads">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Retour aux threads
					</Link>
				</Button>
			</div>

			{/* Thread principal */}
			<Card className="w-full">
				<CardHeader className="space-y-4">
					<div className="flex items-start gap-4">
						<Avatar className="h-12 w-12">
							<AvatarFallback className="bg-primary/10 text-primary">
								{getInitials(threadAuthorName)}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 space-y-2">
							<div className="flex items-center gap-2">
								<span className="font-semibold">{threadAuthorName}</span>
								<Badge
									variant="outline"
									className={getCategoryColor(thread.category)}
								>
									{thread.category}
								</Badge>
							</div>
							<span className="text-xs text-muted-foreground">
								{formatDistanceToNow(new Date(thread.createdAt), {
									addSuffix: true,
									locale: fr,
								})}
							</span>
						</div>
					</div>
					<div>
						<h1 className="text-2xl font-bold">{thread.title}</h1>
					</div>
				</CardHeader>
				<CardContent>
					<SafeHtmlDisplay
						html={thread.body}
						className="text-muted-foreground"
					/>
				</CardContent>
			</Card>

			{/* Statistiques */}
			<div className="flex items-center gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4" />
					<span>
						{posts.length} {posts.length === 1 ? "réponse" : "réponses"}
					</span>
				</div>
			</div>

			{/* Formulaire de réponse */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Ajouter une réponse</h2>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field name="content">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Votre réponse</Label>
									<Textarea
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Partagez votre expérience, vos conseils ou vos questions..."
										className="min-h-[150px]"
										required
									/>
								</div>
							)}
						</form.Field>

						<div
							className={`flex flex-col p-4 border rounded-lg ${
								isThreadSensitive ? "bg-accent border-accent" : "bg-muted/50"
							}`}
						>
							{isThreadSensitive && (
								<div className="flex flex-col gap-1 mb-3">
									<Badge variant="outline" className="w-fit">
										⚠️ Catégorie sensible
									</Badge>
									<p className="text-sm text-foreground/80">
										Tous les posts sont automatiquement anonymes et sensibles
									</p>
								</div>
							)}
							<form.Field name="isSensitive">
								{(field) => (
									<div className="flex items-center justify-between">
										<Label htmlFor={field.name} className="flex flex-col gap-1">
											<span className="font-normal text-xs text-muted-foreground">
												{isThreadSensitive
													? "Obligatoire pour cette catégorie de thread."
													: "Le contenu sera flouté par défaut."}
											</span>
										</Label>
										<Switch
											id={field.name}
											checked={field.state.value}
											onCheckedChange={field.handleChange}
											disabled={isThreadSensitive}
										/>
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name="contentWarnings">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Avertissements (Optionnel)</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ex: Violence, Harcèlement (séparés par des virgules)"
									/>
								</div>
							)}
						</form.Field>

						<div className="flex justify-end">
							<Button type="submit">Publier la réponse</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Liste des réponses */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">
					{posts.length > 0 ? "Réponses" : "Aucune réponse pour le moment"}
				</h2>
				{posts.map((post) => (
					<PostCard
						key={post.id}
						post={{
							...post,
							threadTitle: null, // Pas besoin du titre thread ici
						}}
						threadCategory={thread.category}
					/>
				))}
			</div>
		</div>
	);
}
