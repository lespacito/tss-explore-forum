import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	getCategoryConfig,
	type ThreadCategory,
} from "@/data/threads-categories";
import { createThreadFn } from "@/features/threads/server/create-thread";

export const Route = createFileRoute("/threads/new/$category")({
	component: NewThreadFormPage,
});

function NewThreadFormPage() {
	const { category } = Route.useParams();
	const navigate = useNavigate();
	const router = useRouter();

	const categoryConfig = getCategoryConfig(category as ThreadCategory);

	const form = useForm({
		defaultValues: {
			title: "",
			body: "",
		},
		onSubmit: async ({ value }) => {
			try {
				// Simple client-side validation
				if (value.title.trim().length < 3) {
					toast.error("Le titre doit contenir au moins 3 caractères");
					return;
				}
				if (value.title.length > 200) {
					toast.error("Le titre ne peut pas dépasser 200 caractères");
					return;
				}
				if (value.body.trim().length < 10) {
					toast.error("Le contenu doit contenir au moins 10 caractères");
					return;
				}
				if (value.body.length > 10000) {
					toast.error("Le contenu ne peut pas dépasser 10000 caractères");
					return;
				}

				const result = await createThreadFn({
					data: {
						title: value.title,
						body: value.body,
						category: category as ThreadCategory,
					},
				});

				// Check if secret code was generated for first publication
				if ("secretCode" in result && result.secretCode && result.thread) {
					toast.success("Votre publication a été soumise pour modération !");
					navigate({
						to: "/threads/confirmation",
						search: {
							secretCode: result.secretCode,
							threadSlug: result.thread.slug,
							isFirstPublication: true,
						},
					});
				} else if ("thread" in result && result.thread) {
					toast.success("Votre publication a été soumise pour modération !");
					navigate({ to: "/threads", search: { openDialog: false } });
					router.invalidate();
				}
			} catch (error) {
				console.error(error);
				toast.error(
					error instanceof Error
						? error.message
						: "Erreur lors de la création du thread",
				);
			}
		},
	});

	// Redirect if invalid category
	if (!categoryConfig) {
		navigate({ to: "/threads/new" });
		return null;
	}

	return (
		<div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
			{/* Header with category info */}
			<div className="flex items-start gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/threads/new" })}
					className="mt-1"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-3xl">{categoryConfig.icon}</span>
						<h1 className="text-3xl font-bold tracking-tight">
							{categoryConfig.label}
						</h1>
					</div>
					<p className="text-muted-foreground">{categoryConfig.description}</p>
				</div>
			</div>

			{/* Help text card */}
			<Card className={`${categoryConfig.color} border-2`}>
				<CardContent className="p-4">
					<p className="text-sm">{categoryConfig.helpText}</p>
				</CardContent>
			</Card>

			{/* Guiding questions */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Questions pour vous guider</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm text-muted-foreground">
						{categoryConfig.guidingQuestions.map((question) => (
							<li key={question} className="flex items-start gap-2">
								<span className="text-primary mt-0.5">•</span>
								<span>{question}</span>
							</li>
						))}
					</ul>
					<p className="text-xs text-muted-foreground mt-4 italic">
						Ces questions sont optionnelles. Sentez-vous libre de partager ce
						qui vous semble juste.
					</p>
				</CardContent>
			</Card>

			{/* Form */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* Title field */}
				<form.Field name="title">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Titre de votre publication{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder={categoryConfig.titlePlaceholder}
								className={
									field.state.meta.errors.length > 0 ? "border-destructive" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Body field */}
				<form.Field name="body">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Votre message <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder={categoryConfig.bodyPlaceholder}
								className={`min-h-[300px] ${field.state.meta.errors.length > 0 ? "border-destructive" : ""}`}
							/>
							<div className="flex justify-between items-center">
								<div>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									{field.state.value.length} / 10000 caractères
								</p>
							</div>
						</div>
					)}
				</form.Field>

				{/* Actions */}
				<div className="flex justify-between items-center pt-4">
					<Button
						type="button"
						variant="ghost"
						onClick={() => navigate({ to: "/threads/new" })}
					>
						Retour
					</Button>
					<Button
						type="submit"
						size="lg"
						disabled={form.state.isSubmitting}
						className="gap-2"
					>
						{form.state.isSubmitting ? (
							"Envoi en cours..."
						) : (
							<>
								<Send className="h-4 w-4" />
								Soumettre pour modération
							</>
						)}
					</Button>
				</div>
			</form>

			{/* Safety footer */}
			<Card className="bg-warning/30 border-2 border-warning">
				<CardContent className="p-4">
					<p className="text-sm text-foreground">
						<strong>Rappel important :</strong> Cette plateforme n'est pas un
						service d'urgence. En cas de danger immédiat, contactez le 117
						(Police), le 143 (La Main Tendue) ou le 147 (CPN - Conseils + aide
						147).
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
