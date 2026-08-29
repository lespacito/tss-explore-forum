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
import {
	type ThreadCategory,
	threadCategories,
} from "@/data/threads-categories";
import { ThreadCard } from "@/features/threads/components/thread-card";
import { createThreadFn } from "@/features/threads/server/actions/create-thread";
import { getThreadsCached } from "@/features/threads/server/actions/get-threads";
import { logger } from "@/lib/logger/client-logger";

export const Route = createFileRoute("/threads/")({
	component: ThreadsPage,
	loader: () => getThreadsCached(),
	validateSearch: (search: Record<string, unknown>) => {
		return {
			openDialog: search.openDialog === true || search.openDialog === "true",
		};
	},
});

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
				search: { openDialog: false },
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
						category: value.category as ThreadCategory,
					},
				});

				// Check if secret code was generated for first publication
				if (
					(result as any).isFirstPublication &&
					(result as any).secretCode &&
					(result as any).thread
				) {
					// Redirect to confirmation page with secret code
					router.navigate({
						to: "/threads/confirmation",
						search: {
							secretCode: (result as any).secretCode,
							threadSlug: (result as any).thread.slug,
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

			<div className="space-y-4">
				{threads.map((thread: Parameters<typeof ThreadCard>[0]["thread"]) => (
					<ThreadCard key={thread.id} thread={thread} />
				))}
				{threads.length === 0 && (
					<div className="text-center py-10 text-muted-foreground">
						Aucune discussion pour le moment. Soyez le premier à en créer une !
					</div>
				)}
			</div>
		</div>
	);
}
