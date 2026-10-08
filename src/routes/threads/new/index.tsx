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
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { usePublicationReceipt } from "@/features/beta/components/publication-receipt";
import { SafetyNotice } from "@/features/beta/components/safety-notice";
import { createThreadFn } from "@/features/threads/server/actions/create-thread";
import { useAutoSaveDraft } from "@/hooks/useAutoSaveDraft";
import { logger } from "@/lib/logger/client-logger";
import { validateHtmlContent } from "@/lib/security/validate-html-content";

const realCategoryDescriptions: Record<ThreadCategory, string> = {
	VIOLENCE:
		"Un témoignage concernant des violences physiques ou psychologiques.",
	ABUS: "Un témoignage concernant un abus, une emprise ou une manipulation.",
	TEMOIN:
		"Un témoignage sur une situation de violence ou de harcèlement que vous avez observée.",
	DETRESSE:
		"Un témoignage sur une détresse émotionnelle. Cet espace ne propose pas d’intervention d’urgence ni d’accompagnement professionnel.",
	AUTRE:
		"Un témoignage qui ne correspond pas aux autres catégories. Vous pouvez aussi ne pas choisir de catégorie.",
};

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
	const { publicationMode, submissionsOpen } = useBetaPresentation();
	const real = publicationMode === "real";
	const contributionsSuspended = real && !submissionsOpen;
	const { session, aliasName } = Route.useLoaderData();

	if (!session?.user) {
		return (
			<div className="civic-form-page mx-auto max-w-2xl space-y-6 px-4 py-12">
				<h1 className="font-serif text-4xl font-semibold tracking-tight">
					{contributionsSuspended
						? "Contributions temporairement suspendues"
						: real
							? "Commencer un témoignage"
							: "Créer une situation fictive"}
				</h1>
				<p className="max-w-prose leading-relaxed text-muted-foreground">
					{contributionsSuspended
						? "La lecture reste accessible. L’envoi de nouveaux témoignages est temporairement suspendu."
						: real
							? "Commencez une session sans nom ni adresse email pour rédiger un témoignage."
							: "Commencez une session anonyme pour participer à ce test. Aucun email n’est nécessaire."}
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
	const { publicationMode, accessRequired, submissionsOpen } = useBetaPresentation();
	const real = publicationMode === "real";
	const contributionsSuspended = real && !submissionsOpen;
	const navigate = useNavigate();
	const router = useRouter();
	const { setSecretCode, setSubmissionConfirmed } = usePublicationReceipt();
	const [saveOnDevice, setSaveOnDevice] = useState(false);
	const [textLength, setTextLength] = useState(0);
	const [errors, setErrors] = useState<FormErrors>({});
	const summaryRef = useRef<HTMLDivElement>(null);
	const bodyId = useId();
	const titleId = useId();
	const bodyLabelId = useId();
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
				nextErrors.body = real
					? "Rédigez au moins 10 caractères pour votre témoignage."
					: "Décrivez la situation fictive en au moins 10 caractères.";
			} else if (textLength > 10_000) {
				nextErrors.body = real
					? "Raccourcissez votre témoignage à 10 000 caractères."
					: "Raccourcissez la situation fictive à 10 000 caractères.";
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
							: real
								? "Votre témoignage n’a pas été envoyé. Réessayez."
								: "Votre situation fictive n’a pas été envoyée. Réessayez.",
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
				const realSubmissionErrors = new Map([
					[
						"L’envoi de situations fictives est suspendu. Consultez les informations de l’organisateur.",
						"L’envoi de témoignages est suspendu. Consultez les informations de l’organisateur.",
					],
					[
						"Votre situation fictive n’a pas été envoyée. Réessayez pour obtenir un code de récupération valide.",
						"Votre témoignage n’a pas été envoyé. Réessayez pour obtenir un code de récupération valide.",
					],
				]);
				const realFailureMessage =
					error instanceof Error
						? (realSubmissionErrors.get(error.message) ?? error.message)
						: "Réessayez.";
				const realFailure = realFailureMessage.startsWith(
					"Votre témoignage n’a pas été envoyé.",
				)
					? realFailureMessage
					: `Votre témoignage n’a pas été envoyé. ${realFailureMessage}`;
				setErrors({
					submit:
						error instanceof Error
							? real
								? realFailure
								: `Votre situation fictive n’a pas été envoyée. ${error.message}`
							: real
								? "Votre témoignage n’a pas été envoyé. Réessayez."
								: "Votre situation fictive n’a pas été envoyée. Réessayez.",
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
			<header className="mb-6 sm:mb-10 space-y-4">
				<h1 className="max-w-2xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
					{contributionsSuspended
						? "Contributions temporairement suspendues"
						: real
							? "Rédiger un témoignage"
							: "Rédiger une situation fictive"}
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
					{contributionsSuspended
						? "La lecture reste accessible. L’envoi de nouveaux témoignages est temporairement suspendu. Si vous avez commencé un texte, il reste dans ce formulaire tant que cette page est ouverte."
						: real
							? "Vous pouvez raconter une situation de violence ou de harcèlement que vous avez vécue ou dont vous avez été témoin, à votre rythme et avec vos propres mots. Partagez seulement ce que vous souhaitez rendre public ; évitez les noms de tiers, lieux précis et détails permettant de reconnaître quelqu’un."
							: accessRequired
							? "Cette bêta teste le parcours, pas une situation réelle. N’indiquez aucun nom, lieu précis ou détail permettant d’identifier quelqu’un."
							: "Cette version de démonstration permet uniquement de tester le parcours avec une situation fictive. N’indiquez aucun nom, lieu précis ou détail permettant d’identifier quelqu’un."}
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
				className="space-y-6 sm:space-y-9"
			>
				<form.Field name="body">
					{(field) => (
						<section className="space-y-3">
							<Label
								id={bodyLabelId}
								htmlFor={bodyId}
								className="text-base font-semibold"
							>
								{real
									? "1. Que souhaitez-vous partager ?"
									: "1. Que se passe-t-il dans cette situation fictive ?"}
							</Label>
							<TipTap
								id={bodyId}
								ariaLabelledBy={bodyLabelId}
								content={field.state.value}
								placeholder={
									real
										? "Racontez uniquement ce que vous souhaitez partager…"
										: "Décrivez une situation inventée, avec vos propres mots…"
								}
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
						<li>
							{real
								? "Que souhaitez-vous dire de ce que vous avez vécu ou observé ?"
								: "Qui intervient dans cette situation inventée ?"}
						</li>
						<li>
							{real
								? "Quels éléments vous semblent importants, sans détail identifiant ?"
								: "Quel comportement pose question, concrètement ?"}
						</li>
						<li>
							{real
								? "Vous pouvez vous arrêter ou faire une pause quand vous le souhaitez."
								: "Que se passe-t-il ensuite dans la situation fictive ?"}
						</li>
					</ul>
				</details>

				<form.Field name="title">
					{(field) => (
						<div className="space-y-3">
							<Label htmlFor={titleId} className="text-base font-semibold">
								2. Donnez-lui un titre court (obligatoire)
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
								minLength={3}
								required
								maxLength={200}
								placeholder={
									real
										? "Choisissez un titre sans nom ni détail identifiant"
										: "Ex. Une relation fictive devient contrôlante"
								}
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
								{(real && selectedCategory
									? realCategoryDescriptions[selectedCategory.id]
									: selectedCategory?.description) ??
									(real
										? "Vous pouvez envoyer votre témoignage sans choisir de catégorie."
										: "Vous pouvez envoyer la situation fictive sans choisir de catégorie.")}
							</p>
						</div>
					)}
				</form.Field>

				<section className="civic-review-block">
					<h2 className="font-serif text-2xl font-semibold">Avant l'envoi</h2>
					{aliasName ? (
						<p>
							{real
								? "Si votre témoignage est publié, il apparaîtra sous « Auteur anonyme ». La publication sous votre nom n’est pas proposée actuellement. Votre pseudonyme reste interne et n’est pas affiché publiquement."
								: "Si cette situation fictive est publiée, elle apparaîtra sous « Auteur anonyme ». Votre pseudonyme reste interne et n’est pas affiché publiquement."}
						</p>
					) : (
						<p role="alert">
							Votre session n’a pas pu être vérifiée. L’envoi est désactivé.
							Rechargez la page pour réessayer ; conservez votre texte avant de
							le faire.
						</p>
					)}
					<p>
						Le libellé « Auteur anonyme » ne garantit pas un anonymat absolu :
						l’administration technique peut relier votre session à ses
						pseudonymes. Le contenu peut aussi permettre de vous reconnaître.
					</p>
					<p>
						La modération décide de la publication ; elle ne constitue pas une
						aide professionnelle et ne promet aucune réponse de soutien.
					</p>
					<p>
						{real
							? "Chaque témoignage est examiné par une personne avant d’être rendu public. La modération décide de le publier ou de le garder non publié. Si nécessaire, un contenu publié sera masqué derrière un avertissement de sensibilité."
							: "Une personne l’examinera avant toute publication. Elle pourra la publier ou la garder non publiée. Si nécessaire, un contenu publié sera masqué derrière un avertissement de sensibilité."}
					</p>
					<p className="font-medium">
						Après l'envoi, son statut sera « À examiner ».
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
						disabled={isSubmitting || !aliasName || contributionsSuspended}
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
