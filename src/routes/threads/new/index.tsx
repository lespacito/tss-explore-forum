import { useForm, useStore } from "@tanstack/react-form";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { TipTap } from "@/components/tiptap/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type ThreadCategory,
	threadCategories,
} from "@/data/threads-categories";
import { getCurrentPrimaryAliasFn } from "@/features/alias/server/actions/get-primary-alias";
import { AnonymousPostButton } from "@/features/auth/components/AnonymousPostButton";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { usePublicationReceipt } from "@/features/beta/components/publication-receipt";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
import { createThreadFn } from "@/features/threads/server/actions/create-thread";
import { useAutoSaveDraft } from "@/hooks/useAutoSaveDraft";
import { logger } from "@/lib/logger/client-logger";
import { validateHtmlContent } from "@/lib/security/validate-html-content";

export const Route = createFileRoute("/threads/new/")({
	component: NewThreadPage,
	loader: async () => {
		const session = await getAuthSession();
		const aliasName = session?.user ? await getCurrentPrimaryAliasFn() : null;
		return { session, aliasName };
	},
});

type FormErrors = {
	body?: string;
	title?: string;
	submit?: string;
};

function NewThreadPage() {
	const { session, aliasName } = Route.useLoaderData();

	if (!session?.user) {
		return (
			<div className="civic-form-page mx-auto max-w-2xl space-y-6 px-4 py-12">
				<h1 className="font-serif text-4xl font-semibold tracking-tight">
					Créer un scénario fictif
				</h1>
				<p className="max-w-prose leading-7 text-muted-foreground">
					Commencez une session anonyme pour participer à ce test. Aucun email
					n’est nécessaire.
				</p>
				<AnonymousPostButton />
			</div>
		);
	}

	return <ScenarioForm user={session.user} aliasName={aliasName} />;
}

export function ScenarioForm({
	user,
	aliasName,
}: {
	user: NonNullable<Awaited<ReturnType<typeof getAuthSession>>["user"]>;
	aliasName: string | null;
}) {
	const navigate = useNavigate();
	const router = useRouter();
	const { setSecretCode, setSubmissionConfirmed } = usePublicationReceipt();
	const [saveOnDevice, setSaveOnDevice] = useState(false);
	const [textLength, setTextLength] = useState(0);
	const [errors, setErrors] = useState<FormErrors>({});
	const summaryRef = useRef<HTMLDivElement>(null);
	const bodyId = useId();
	const titleId = useId();
	const bodyErrorId = useId();
	const titleErrorId = useId();

	const form = useForm({
		defaultValues: {
			body: "",
			title: "",
			category: "" as ThreadCategory | "",
		},
		onSubmit: async ({ value }) => {
			const nextErrors: FormErrors = {};
			if (textLength < 10) {
				nextErrors.body = "Décrivez le scénario en au moins 10 caractères.";
			} else if (textLength > 10_000) {
				nextErrors.body = "Raccourcissez le scénario à 10 000 caractères.";
			} else {
				const htmlValidation = validateHtmlContent(value.body);
				if (!htmlValidation.isValid) {
					nextErrors.body =
						htmlValidation.error ??
						"Utilisez uniquement les options de formatage proposées.";
				}
			}
			if (value.title.trim().length < 3) {
				nextErrors.title = "Donnez un titre d’au moins 3 caractères.";
			} else if (value.title.length > 200) {
				nextErrors.title = "Raccourcissez le titre à 200 caractères.";
			}

			if (Object.keys(nextErrors).length > 0) {
				setErrors(nextErrors);
				return;
			}

			setErrors({});
			try {
				const result = await createThreadFn({
					data: {
						body: value.body,
						title: value.title,
						category: value.category || null,
					},
				});

				if (!("thread" in result) || !result.thread) {
					throw new Error(
						"error" in result
							? result.error
							: "Votre scénario n’a pas été envoyé. Réessayez.",
					);
				}

				clearTitleDraft();
				clearBodyDraft();
				setSecretCode("secretCode" in result ? (result.secretCode ?? "") : "");
				setSubmissionConfirmed(true);
				await router.invalidate();
				await navigate({ to: "/threads/confirmation" });
			} catch (error) {
				logger.error("Failed to create scenario:", error);
				setErrors({
					submit:
						error instanceof Error
							? `Votre scénario n’a pas été envoyé. ${error.message}`
							: "Votre scénario n’a pas été envoyé. Réessayez.",
				});
			}
		},
	});

	const body = useStore(form.store, (state) => state.values.body);
	const title = useStore(form.store, (state) => state.values.title);
	const category = useStore(form.store, (state) => state.values.category);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
	const hasStarted = textLength > 0;

	const { hasDraft: hasTitleDraft, clearDraft: clearTitleDraft } =
		useAutoSaveDraft({
			key: `draft-scenario-${user.id}-title`,
			value: title,
			enabled: saveOnDevice,
		});
	const { hasDraft: hasBodyDraft, clearDraft: clearBodyDraft } =
		useAutoSaveDraft({
			key: `draft-scenario-${user.id}-body`,
			value: body,
			enabled: saveOnDevice,
		});

	const errorCount = Object.values(errors).filter(Boolean).length;
	useEffect(() => {
		if (errorCount > 1) summaryRef.current?.focus();
	}, [errorCount]);

	const selectedCategory = threadCategories.find(
		(item) => item.id === category,
	);
	return (
		<div className="civic-form-page mx-auto max-w-3xl px-4 py-10 sm:py-14">
			<header className="mb-10 space-y-4">
				<h1 className="max-w-2xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
					Rédiger un scénario fictif
				</h1>
				<p className="max-w-2xl text-base leading-7 text-muted-foreground">
					Cette bêta teste le parcours, pas une situation réelle. N’indiquez
					aucun nom, lieu précis ou détail permettant d’identifier quelqu’un.
				</p>
			</header>

			{errorCount > 1 && (
				<div
					ref={summaryRef}
					tabIndex={-1}
					role="alert"
					className="mb-8 border-y border-destructive py-4"
				>
					<p className="font-semibold">Deux éléments sont à corriger.</p>
					<ul className="mt-2 list-disc pl-5 text-sm">
						{errors.body && (
							<li>
								<a className="underline underline-offset-4" href={`#${bodyId}`}>
									{errors.body}
								</a>
							</li>
						)}
						{errors.title && (
							<li>
								<a
									className="underline underline-offset-4"
									href={`#${titleId}`}
								>
									{errors.title}
								</a>
							</li>
						)}
					</ul>
				</div>
			)}

			<form
				noValidate
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-9"
			>
				<form.Field name="body">
					{(field) => (
						<section className="space-y-3">
							<Label htmlFor={bodyId} className="text-base font-semibold">
								1. Que se passe-t-il dans ce scénario fictif ?
							</Label>
							<TipTap
								id={bodyId}
								content={field.state.value}
								placeholder="Décrivez une situation inventée, avec vos propres mots…"
								ariaInvalid={Boolean(errors.body)}
								ariaDescribedBy={errors.body ? bodyErrorId : undefined}
								onChange={(html) => {
									field.handleChange(html);
									if (errors.body || errors.submit) {
										setErrors((current) => ({
											...current,
											body: undefined,
											submit: undefined,
										}));
									}
								}}
								onTextChange={(_text, length) => setTextLength(length)}
							/>
							<div className="flex min-h-6 items-start justify-between gap-4">
								{errors.body ? (
									<p
										id={bodyErrorId}
										role="alert"
										className="text-sm text-destructive"
									>
										{errors.body}
									</p>
								) : (
									<span />
								)}
								<p className="shrink-0 text-xs tabular-nums text-muted-foreground">
									{textLength} / 10 000
								</p>
							</div>
							{hasStarted && (
								<div className="civic-draft-choice">
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
										<span className="text-sm">
											Conserver un brouillon sur cet appareil
											<span className="mt-1 block text-muted-foreground">
												Toute personne utilisant ce navigateur pourra le lire.
											</span>
										</span>
									</label>
									{saveOnDevice && (hasTitleDraft || hasBodyDraft) && (
										<p className="mt-2 text-xs text-muted-foreground">
											Brouillon enregistré sur cet appareil.
										</p>
									)}
								</div>
							)}
						</section>
					)}
				</form.Field>

				<details className="border-y py-4">
					<summary className="min-h-11 cursor-pointer font-medium">
						Besoin d’aide pour commencer ?
					</summary>
					<ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
						<li>Qui intervient dans cette situation inventée ?</li>
						<li>Quel comportement pose question, concrètement ?</li>
						<li>Que se passe-t-il ensuite dans le scénario ?</li>
					</ul>
				</details>

				<form.Field name="title">
					{(field) => (
						<div className="space-y-3">
							<Label htmlFor={titleId} className="text-base font-semibold">
								2. Donnez-lui un titre court
							</Label>
							<Input
								id={titleId}
								name={field.name}
								value={field.state.value}
								onChange={(event) => {
									field.handleChange(event.target.value);
									if (errors.title) {
										setErrors((current) => ({ ...current, title: undefined }));
									}
								}}
								maxLength={200}
								placeholder="Ex. Une relation fictive devient contrôlante"
								aria-invalid={Boolean(errors.title)}
								aria-describedby={errors.title ? titleErrorId : undefined}
							/>
							{errors.title && (
								<p
									id={titleErrorId}
									role="alert"
									className="text-sm text-destructive"
								>
									{errors.title}
								</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="category">
					{(field) => (
						<div className="space-y-3">
							<Label htmlFor={field.name} className="text-base font-semibold">
								3. Catégorie{" "}
								<span className="font-normal text-muted-foreground">
									(facultatif)
								</span>
							</Label>
							<select
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(event) =>
									field.handleChange(event.target.value as ThreadCategory | "")
								}
								className="flex min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm"
							>
								<option value="">Je ne sais pas / ne pas classer</option>
								{threadCategories.map((item) => (
									<option key={item.id} value={item.id}>
										{item.label}
									</option>
								))}
							</select>
							<p className="text-sm leading-6 text-muted-foreground">
								{selectedCategory?.description ??
									"Vous pouvez envoyer le scénario sans choisir de catégorie."}
							</p>
						</div>
					)}
				</form.Field>

				<section className="civic-review-block">
					<h2 className="font-serif text-2xl font-semibold">Avant l’envoi</h2>
					{aliasName ? (
						<p>
							S’il est publié, le scénario apparaîtra sous l’alias{" "}
							<strong>{aliasName}</strong>. Votre identité réelle n’est pas
							affichée.
						</p>
					) : (
						<p role="alert" className="font-medium text-destructive">
							Votre alias n’a pas pu être chargé. Rechargez la page avant
							d’envoyer ce scénario.
						</p>
					)}
					<p>
						Une personne l’examinera avant toute publication. Elle pourra le
						publier ou le garder non publié. Si nécessaire, un contenu publié
						sera masqué derrière un avertissement de sensibilité.
					</p>
					<p className="font-medium">
						Après l’envoi, son statut sera « À examiner ».
					</p>
				</section>

				{errors.submit && (
					<p
						role="alert"
						className="border-y border-destructive py-4 text-sm font-medium text-destructive"
					>
						{errors.submit} Votre texte est toujours dans ce formulaire.
					</p>
				)}

				<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
					<Button
						type="button"
						variant="ghost"
						onClick={() => navigate({ to: "/" })}
					>
						Annuler
					</Button>
					<Button
						type="submit"
						size="lg"
						disabled={isSubmitting || !aliasName}
						className="min-h-12 gap-2 px-6"
					>
						{isSubmitting ? (
							"Envoi en cours…"
						) : (
							<>
								<Send className="size-4" /> Envoyer pour examen
							</>
						)}
					</Button>
				</div>
			</form>

			<div className="mt-12">
				<SafetyNotice />
			</div>
		</div>
	);
}
