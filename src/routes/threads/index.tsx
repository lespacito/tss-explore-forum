import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadCategory } from "@/data/threads-categories";
import { threadCategories } from "@/data/threads-categories";
import { ThreadCard } from "@/features/threads/components/thread-card";
import { createThreadFn } from "@/features/threads/server/actions/create-thread";
import {
	getThreadsByCategoryFn,
	getThreadsCached,
} from "@/features/threads/server/actions/get-threads";
import { logger } from "@/lib/logger/client-logger";
import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/utils/thread-utils";

const VALID_CATEGORIES: readonly ThreadCategory[] = [
	"VIOLENCE",
	"ABUS",
	"TEMOIN",
	"DETRESSE",
	"AUTRE",
];

type ThreadsSearch = { category?: ThreadCategory; openDialog?: boolean };

export const Route = createFileRoute("/threads/")({
	head: () => ({
		meta: [
			{ title: "Fil de discussions — Parlons Violence" },
			{
				name: "description",
				content:
					"Explorez les discussions de la communauté sur la violence, l'abus, le témoignage et la détresse. Rejoignez les échanges anonymes et bienveillants.",
			},
			{
				property: "og:title",
				content: "Fil de discussions — Parlons Violence",
			},
			{
				property: "og:description",
				content:
					"Discussions anonymes sur la violence, l'abus et la détresse. Partagez, écoutez, soutenez.",
			},
			{
				property: "og:url",
				content: "https://parlonsviolence.ch/threads",
			},
		],
		links: [
			{ rel: "canonical", href: "https://parlonsviolence.ch/threads" },
		],
	}),
	component: ThreadsPage,
	loader: ({ location }) => {
		const search = location.search as Record<string, string | undefined>;
		const rawCategory =
			typeof search.category === "string"
				? search.category.toUpperCase()
				: undefined;
		const category =
			rawCategory && VALID_CATEGORIES.includes(rawCategory as ThreadCategory)
				? (rawCategory as ThreadCategory)
				: undefined;
		return category
			? getThreadsByCategoryFn({ data: { category } })
			: getThreadsCached();
	},
	validateSearch: (search: Record<string, unknown>): ThreadsSearch => {
		const rawCategory =
			typeof search.category === "string"
				? search.category.toUpperCase()
				: undefined;
		return {
			openDialog: search.openDialog === true || search.openDialog === "true",
			category:
				rawCategory && VALID_CATEGORIES.includes(rawCategory as ThreadCategory)
					? (rawCategory as ThreadCategory)
					: undefined,
		};
	},
});

/** Filtres de catégorie — boutons accessibles (AC4) */
function CategoryFilter({
	activeCategory,
}: {
	activeCategory?: ThreadCategory;
}) {
	const router = useRouter();

	return (
		<fieldset className="flex flex-wrap gap-2 border-0 p-0 m-0">
			<legend className="sr-only">Filtrer par catégorie</legend>
			<button
				type="button"
				aria-pressed={!activeCategory}
				onClick={() =>
					router.navigate({ to: "/threads", search: {} as ThreadsSearch })
				}
				className={cn(
					"px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
					!activeCategory
						? "bg-primary text-primary-foreground"
						: "bg-muted hover:bg-muted/80 text-muted-foreground",
				)}
			>
				Toutes
			</button>
			{threadCategories.map((cat) => (
				<button
					key={cat.id}
					type="button"
					aria-pressed={activeCategory === cat.id}
					onClick={() =>
						router.navigate({
							to: "/threads",
							search: { category: cat.id } as ThreadsSearch,
						})
					}
					className={cn(
						"px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
						activeCategory === cat.id
							? getCategoryColor(cat.id)
							: "bg-muted hover:bg-muted/80 text-muted-foreground border-transparent",
					)}
				>
					{cat.icon} {cat.label}
				</button>
			))}
		</fieldset>
	);
}

/** État vide bienveillant selon contexte (AC3) */
function EmptyThreadsState({
	activeCategory,
}: {
	activeCategory?: ThreadCategory;
}) {
	const router = useRouter();

	if (activeCategory) {
		const catConfig = threadCategories.find((c) => c.id === activeCategory);
		const otherCategories = threadCategories.filter(
			(c) => c.id !== activeCategory,
		);

		return (
			<div className="text-center py-12 space-y-4">
				<p className="text-muted-foreground text-lg">
					Pas encore de discussions dans cette catégorie.
				</p>
				<p className="text-muted-foreground text-sm">
					{catConfig
						? `Soyez le premier à partager une expérience dans "${catConfig.label}".`
						: "Soyez le premier à partager votre expérience dans cette catégorie."}
				</p>
				<div className="flex flex-wrap justify-center gap-2 pt-2">
					{otherCategories.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() =>
								router.navigate({
									to: "/threads",
									search: { category: cat.id } as ThreadsSearch,
								})
							}
							className="px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
						>
							{cat.icon} {cat.label}
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={() =>
						router.navigate({ to: "/threads", search: {} as ThreadsSearch })
					}
					className="text-sm text-primary hover:underline block mx-auto"
				>
					Voir toutes les discussions
				</button>
			</div>
		);
	}

	return (
		<div className="text-center py-10 text-muted-foreground">
			Aucune discussion pour le moment. Soyez le premier à en créer une !
		</div>
	);
}

function ThreadsPage() {
	const threads = Route.useLoaderData();
	const router = useRouter();
	const search = Route.useSearch();
	const [isOpen, setIsOpen] = useState(false);

	// OPTIMIZATION: Memoize handler to prevent unnecessary effect re-runs
	const handleOpenDialog = useCallback(() => {
		if (search.openDialog) {
			setIsOpen(true);
			// Clear the search param after opening
			router.navigate({
				to: "/threads",
				search: {},
				replace: true,
			});
		}
	}, [search.openDialog, router]);

	// Auto-open dialog if coming from anonymous session creation
	useEffect(() => {
		handleOpenDialog();
	}, [handleOpenDialog]);

	const form = useForm({
		defaultValues: {
			title: "",
			body: "",
			category: "",
		},
		onSubmit: async ({ value }) => {
			try {
				if (!value.category) {
					toast.error("Veuillez sélectionner une catégorie");
					return;
				}

				const result = await createThreadFn({
					data: {
						title: value.title,
						body: value.body,
						category: value.category,
					},
				});

				// Check if secret code was generated for first publication
				if (result.isFirstPublication && result.secretCode && result.thread) {
					// Redirect to confirmation page with secret code
					router.navigate({
						to: "/threads/confirmation",
						search: {
							secretCode: result.secretCode,
							threadSlug: result.thread.slug,
							isFirstPublication: true,
						},
					});
				} else {
					// Normal flow - show success and refresh
					toast.success("Thread créé avec succès");
					setIsOpen(false);
					form.reset();
					router.invalidate();
				}
			} catch (error) {
				logger.error("Failed to create thread:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "Erreur lors de la création du thread",
				);
			}
		},
	});

	return (
		<div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Fil de discussions
					</h1>
					<p className="text-muted-foreground">
						Démarrez une nouvelle discussion ou explorez les sujets existants.
					</p>
				</div>
				<Button
					className="gap-2"
					onClick={() => router.navigate({ to: "/threads/new" })}
				>
					<Plus className="h-4 w-4" />
					Créer une publication
				</Button>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Créer une nouvelle discussion</DialogTitle>
							<DialogDescription>
								Lancez une discussion sur un sujet qui vous tient à cœur.
							</DialogDescription>
						</DialogHeader>

						{/* Safety Warning */}
						<div className="p-3 bg-warning/30 border-2 border-warning rounded-lg">
							<div className="flex items-start gap-2">
								<span className="text-xl">⚠️</span>
								<div className="flex-1">
									<p className="text-xs text-foreground font-bold mb-1">
										Important : Cette plateforme n&apos;est pas un service
										d&apos;urgence
									</p>
									<p className="text-xs text-foreground">
										En cas de danger immédiat, contactez le 117 (Police), le 143
										(La Main Tendue) ou le 147 (CPN - Conseils + aide 147).
									</p>
								</div>
							</div>
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.Field name="title">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Titre</Label>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Un titre clair et descriptif..."
											required
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="category">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Catégorie</Label>
										<Select
											value={field.state.value}
											onValueChange={field.handleChange}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionnez une catégorie" />
											</SelectTrigger>
											<SelectContent>
												{threadCategories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.icon} {category.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							</form.Field>

							<form.Field name="body">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Description</Label>
										<Textarea
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Décrivez votre sujet en détail..."
											className="min-h-[200px]"
											required
										/>
									</div>
								)}
							</form.Field>

							<div className="flex justify-end gap-2 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsOpen(false)}
								>
									Annuler
								</Button>
								<Button type="submit">Créer la discussion</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Category filter — AC1, AC4 */}
			<CategoryFilter activeCategory={search.category} />

			<div className="space-y-4">
				{threads.map((thread) => (
					<ThreadCard key={thread.id} thread={thread} />
				))}
				{threads.length === 0 && (
					<EmptyThreadsState activeCategory={search.category} />
				)}
			</div>
		</div>
	);
}
