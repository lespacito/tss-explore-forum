import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-form";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
import { usePublicationReceipt } from "@/features/beta/components/publication-receipt";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { ArrowLeft, FileText, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TipTap } from "@/components/tiptap/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	getCategoryConfig,
	type ThreadCategory,
} from "@/data/threads-categories";
import { createThreadFn } from "@/features/threads/server/actions/create-thread";
import { useAutoSaveDraft } from "@/hooks/useAutoSaveDraft";
import { logger } from "@/lib/logger/client-logger";
import { validateHtmlContent } from "@/lib/security/validate-html-content";

export const Route = createFileRoute("/threads/new/$category")({
	component: NewThreadFormPage,
	loader: async ({ params }) => {
		if (!getCategoryConfig(params.category as ThreadCategory))
			throw redirect({ to: "/threads/new" });
		const session = await getAuthSession();
		if (!session.user) throw redirect({ to: "/threads/new" });
		return { userId: session.user.id };
	},
});

function NewThreadFormPage() {
	const { category } = Route.useParams();
	const navigate = useNavigate();
	const router = useRouter();
	const { userId } = Route.useLoaderData();
	const { setSecretCode } = usePublicationReceipt();
	const [saveOnDevice, setSaveOnDevice] = useState(false);
	const [textLength, setTextLength] = useState(0);
	const [draftRestored, setDraftRestored] = useState(false);

	const categoryConfig = getCategoryConfig(category as ThreadCategory);

	const form = useForm({
		defaultValues: {
			title: "",
			body: "",
		},
		onSubmit: async ({ value }) => {
			try {
				// Client-side validation - Title
				if (value.title.trim().length < 3) {
					toast.error("Le titre doit contenir au moins 3 caractères", {
						description: "Prenez le temps de décrire votre situation",
					});
					return;
				}
				if (value.title.length > 200) {
					toast.error("Le titre ne peut pas dépasser 200 caractères", {
						description: "Essayez de résumer en quelques mots",
					});
					return;
				}

				// Client-side validation - Content length
				if (textLength < 10) {
					toast.error("Le contenu doit contenir au moins 10 caractères", {
						description:
							"Quelques phrases suffisent pour partager ce qui vous préoccupe",
					});
					return;
				}
				if (textLength > 10000) {
					toast.error("Le contenu ne peut pas dépasser 10000 caractères", {
						description:
							"Essayez de vous concentrer sur l'essentiel de votre message",
					});
					return;
				}

				// Client-side security validation - HTML content
				const htmlValidation = validateHtmlContent(value.body);
				if (!htmlValidation.isValid) {
					toast.error("Contenu non autorisé", {
						description:
							htmlValidation.error ||
							"Veuillez utiliser uniquement le formatage de base",
					});
					return;
				}

				const result = await createThreadFn({
					data: {
						title: value.title,
						body: value.body,
						category: category as ThreadCategory,
					},
				});

				// Clear drafts after successful submission

				if (!("thread" in result) || !result.thread) {
					throw new Error(
						"error" in result
							? result.error
							: "Le dépôt n’a pas été confirmé. Réessayez.",
					);
				}
				clearTitleDraft();
				clearBodyDraft();
				setSecretCode("secretCode" in result ? (result.secretCode ?? "") : "");
				toast.success("Votre publication a été envoyée pour modération.");
				await router.invalidate();
				await navigate({ to: "/threads/confirmation" });
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

	const draftTitle = useStore(form.store, (state) => state.values.title);
	const draftBody = useStore(form.store, (state) => state.values.body);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
	// Auto-save only with consent, scoped to this session owner.
	// Auto-save title to localStorage
	const {
		restoredDraft: restoredTitle,
		hasDraft: hasTitleDraft,
		clearDraft: clearTitleDraft,
	} = useAutoSaveDraft({
		key: `draft-thread-${userId}-${category}-title`,
		value: draftTitle,
		enabled: saveOnDevice,
		delay: 1500,
	});

	// Auto-save body to localStorage
	const {
		restoredDraft: restoredBody,
		hasDraft: hasBodyDraft,
		clearDraft: clearBodyDraft,
	} = useAutoSaveDraft({
		key: `draft-thread-${userId}-${category}-body`,
		value: draftBody,
		enabled: saveOnDevice,
		delay: 1500,
	});

	// Restore drafts when the auto-save hooks finish loading localStorage.
	useEffect(() => {
		if (restoredTitle) {
			form.setFieldValue("title", restoredTitle);
		}
		if (restoredBody) {
			form.setFieldValue("body", restoredBody);
		}

		// Show toast if draft was restored
		if (hasTitleDraft || hasBodyDraft) {
			setDraftRestored(true);
			toast.info("Brouillon restauré", {
				duration: 3000,
				description: "Votre brouillon précédent a été récupéré",
			});
		}
	}, [
		form.setFieldValue,
		hasBodyDraft,
		hasTitleDraft,
		restoredBody,
		restoredTitle,
	]);

	const forgetDraft = () => {
		setSaveOnDevice(false);
		clearTitleDraft();
		clearBodyDraft();
		form.reset();
		setDraftRestored(false);
		toast.success("Brouillon effacé de cet appareil.");
	};
	if (!categoryConfig) return null;

	return (
		<div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
			{/* Header with category info */}
			<div className="flex items-start gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate({ to: "/threads/new" })}
					className="mt-1"
					aria-label="Revenir aux catégories"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2 mb-2">
						<span className="text-3xl">{categoryConfig.icon}</span>
						<h1 className="text-3xl font-bold tracking-tight">
							{categoryConfig.label}
						</h1>
						{draftRestored && (
							<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/80 text-accent-foreground">
								<FileText className="h-3 w-3" />
								Brouillon restauré
							</span>
						)}
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

			<aside className="space-y-3 rounded-xl border p-4 text-sm">
				<p>
					Première cohorte : rédigez uniquement un scénario fictif, sans détail
					identifiant.
				</p>
				<label className="flex min-h-11 items-start gap-3">
					<input
						type="checkbox"
						checked={saveOnDevice}
						onChange={(event) => {
							setSaveOnDevice(event.target.checked);
							if (!event.target.checked) {
								clearTitleDraft();
								clearBodyDraft();
							}
						}}
						className="mt-1 size-5 shrink-0"
					/>
					<span>
						Conserver mon brouillon sur cet appareil. Toute personne utilisant
						ce navigateur pourrait le retrouver. Réactivez cette option pour
						restaurer un brouillon conservé.
					</span>
				</label>
				<Button type="button" variant="outline" onClick={forgetDraft}>
					Effacer le brouillon
				</Button>
			</aside>
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
								required
								minLength={3}
								maxLength={200}
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
							<Label id="body-label">
								Votre message <span className="text-destructive">*</span>
							</Label>
							<TipTap
								content={field.state.value}
								placeholder={categoryConfig.bodyPlaceholder}
								onChange={(html) => field.handleChange(html)}
								onTextChange={(_text, length) => setTextLength(length)}
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
									{textLength} / 10000 caractères
								</p>
							</div>
						</div>
					)}
				</form.Field>

				{/* Moderation Info (Story 2.4) */}
				<Card className="bg-warning/30 border-2 border-warning">
					<CardContent className="p-4">
						<p className="text-sm text-foreground">
							<strong>Modération :</strong> Votre publication sera examinée par
							le modérateur avant sa mise en ligne. Consultez les créneaux
							indiqués dans votre invitation et le statut dans Mes publications.
						</p>
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex flex-wrap justify-between items-center gap-4 pt-4">
					<div className="flex gap-2">
						<Button
							type="button"
							variant="ghost"
							onClick={() => navigate({ to: "/threads/new" })}
						>
							Retour
						</Button>
					</div>
					<Button
						type="submit"
						size="lg"
						disabled={isSubmitting}
						className="gap-2"
					>
						{isSubmitting ? (
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

			<SafetyNotice />
		</div>
	);
}
