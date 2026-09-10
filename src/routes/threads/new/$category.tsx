import { useForm, useStore } from "@tanstack/react-form";
import {
	createFileRoute,
	redirect,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { TipTap } from "@/components/tiptap/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	getCategoryConfig,
	type ThreadCategory,
} from "@/data/threads-categories";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { usePublicationReceipt } from "@/features/beta/components/publication-receipt";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
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
	const { setSecretCode, setSubmissionConfirmed } = usePublicationReceipt();
	const [saveOnDevice, setSaveOnDevice] = useState(false);
	const [textLength, setTextLength] = useState(0);
	const [draftRestored, setDraftRestored] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		title?: string;
		body?: string;
	}>({});
	const titleErrorId = useId();
	const bodyId = useId();
	const bodyErrorId = useId();

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
					setValidationErrors({
						title: "Saisissez un titre d’au moins 3 caractères.",
					});
					toast.error("Le titre doit contenir au moins 3 caractères", {
						description: "Décrivez le scénario fictif en quelques mots",
					});
					return;
				}
				if (value.title.length > 200) {
					setValidationErrors({
						title: "Raccourcissez le titre à 200 caractères maximum.",
					});
					toast.error("Le titre ne peut pas dépasser 200 caractères", {
						description: "Essayez de résumer en quelques mots",
					});
					return;
				}

				// Client-side validation - Content length
				if (textLength < 10) {
					setValidationErrors({
						body: "Rédigez un message d’au moins 10 caractères.",
					});
					toast.error("Le contenu doit contenir au moins 10 caractères", {
						description:
							"Quelques phrases suffisent pour décrire le scénario fictif",
					});
					return;
				}
				if (textLength > 10000) {
					setValidationErrors({
						body: "Raccourcissez le message à 10 000 caractères maximum.",
					});
					toast.error("Le contenu ne peut pas dépasser 10000 caractères", {
						description:
							"Essayez de vous concentrer sur l'essentiel de votre message",
					});
					return;
				}

				// Client-side security validation - HTML content
				const htmlValidation = validateHtmlContent(value.body);
				if (!htmlValidation.isValid) {
					setValidationErrors({
						body:
							htmlValidation.error ??
							"Utilisez uniquement les options de formatage proposées.",
					});
					toast.error("Contenu non autorisé", {
						description:
							htmlValidation.error ||
							"Veuillez utiliser uniquement le formatage de base",
					});
					return;
				}
				setValidationErrors({});

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
				setSubmissionConfirmed(true);
				toast.success("Votre publication a été envoyée pour modération.");
				await router.invalidate();
				await navigate({ to: "/threads/confirmation" });
			} catch (error) {
				logger.error("Failed to create thread:", error);
				toast.error(
					error instanceof Error
						? error.message
						: "La publication n’a pas pu être envoyée. Réessayez.",
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
		setDraftRestored(false);
		toast.success("Copie enregistrée retirée", {
			description: "Votre texte reste dans ce formulaire.",
		});
	};
	if (!categoryConfig) return null;

	return (
		<main className="container mx-auto max-w-3xl space-y-8 px-4 py-8">
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
					<div className="mb-2 flex flex-wrap items-center gap-3">
						<h1 className="font-serif text-3xl font-semibold">
							{categoryConfig.label}
						</h1>
						{draftRestored && (
							<span className="text-xs font-medium text-muted-foreground">
								Brouillon restauré
							</span>
						)}
					</div>
					<p className="text-muted-foreground">{categoryConfig.description}</p>
				</div>
			</div>

			<details className="border-y py-4 text-sm">
				<summary className="cursor-pointer font-medium underline-offset-4 hover:underline">
					Besoin d’aide pour commencer ?
				</summary>
				<div className="mt-3 space-y-3 text-muted-foreground">
					<p>{categoryConfig.helpText}</p>
					<ul className="list-disc space-y-1 pl-5">
						{categoryConfig.guidingQuestions.map((question) => (
							<li key={question}>{question}</li>
						))}
					</ul>
				</div>
			</details>

			<aside className="space-y-3 text-sm">
				<p className="font-medium">
					Pour ce test, rédigez uniquement un scénario fictif, sans détail
					permettant d’identifier quelqu’un.
				</p>
				<label className="flex min-h-11 items-start gap-3">
					<input
						type="checkbox"
						checked={saveOnDevice}
						onChange={(event) => {
							setSaveOnDevice(event.target.checked);
							if (!event.target.checked) {
								const hadStoredDraft = hasTitleDraft || hasBodyDraft;
								clearTitleDraft();
								clearBodyDraft();
								setDraftRestored(false);
								if (hadStoredDraft) {
									toast.success("Copie enregistrée retirée", {
										description: "Votre texte reste dans ce formulaire.",
									});
								}
							}
						}}
						className="mt-1 size-5 shrink-0"
					/>
					<span>
						Conserver une copie sur cet appareil
						<span className="mt-1 block text-muted-foreground">
							Toute personne utilisant ce navigateur pourra la retrouver.
						</span>
					</span>
				</label>
				{(hasTitleDraft || hasBodyDraft) && (
					<Button type="button" variant="outline" onClick={forgetDraft}>
						Retirer la copie enregistrée
					</Button>
				)}
			</aside>
			<form
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
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
								onChange={(e) => {
									field.handleChange(e.target.value);
									if (validationErrors.title) {
										setValidationErrors((current) => ({
											...current,
											title: undefined,
										}));
									}
								}}
								onBlur={field.handleBlur}
								placeholder={categoryConfig.titlePlaceholder}
								aria-invalid={Boolean(validationErrors.title)}
								aria-describedby={
									validationErrors.title ? titleErrorId : undefined
								}
								className={
									field.state.meta.errors.length > 0 ? "border-destructive" : ""
								}
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">
									{field.state.meta.errors[0]}
								</p>
							)}
							{validationErrors.title && (
								<p
									id={titleErrorId}
									role="alert"
									className="text-sm text-destructive"
								>
									{validationErrors.title}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="body">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={bodyId}>
								Votre message <span className="text-destructive">*</span>
							</Label>
							<TipTap
								id={bodyId}
								content={field.state.value}
								placeholder={categoryConfig.bodyPlaceholder}
								ariaInvalid={Boolean(validationErrors.body)}
								ariaDescribedBy={
									validationErrors.body ? bodyErrorId : undefined
								}
								onChange={(html) => {
									field.handleChange(html);
									if (validationErrors.body) {
										setValidationErrors((current) => ({
											...current,
											body: undefined,
										}));
									}
								}}
								onTextChange={(_text, length) => setTextLength(length)}
							/>
							<div className="flex justify-between items-center">
								<div>
									{field.state.meta.errors.length > 0 && (
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
									)}
									{validationErrors.body && (
										<p
											id={bodyErrorId}
											role="alert"
											className="text-sm text-destructive"
										>
											{validationErrors.body}
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

				<p className="border-t pt-4 text-sm text-muted-foreground">
					Votre publication sera examinée avant sa mise en ligne. Suivez son
					statut dans Mes publications.
				</p>

				<div className="flex justify-end pt-2">
					<Button
						type="submit"
						size="lg"
						disabled={isSubmitting}
						className="min-h-11 w-full gap-2 sm:w-auto"
					>
						{isSubmitting ? (
							"Envoi en cours…"
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
		</main>
	);
}
