import { useId, useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/hooks";
import ActionButton from "@/components/ui/action-button";
import { Field, FieldGroup } from "@/components/ui/field";
import { signUp } from "@/features/auth/lib/auth-client";
import { parseSignUpError } from "@/features/auth/lib/client/parse-auth-error";
import type { User } from "@/features/auth/lib/map-auth-user";
import {
	type SignUpInput,
	signUpSchema,
} from "@/features/auth/schemas/sign-up-schema";
import { sendWelcomeEmailFn } from "@/features/auth/server/send-welcome-email";
import { logger } from "@/lib/logger/client-logger";
import { LinkAnonymousModal } from "./link-anonymous-modal";

export const SignUpTab = ({
	openEmailVerificationTab,
	currentUser,
}: {
	openEmailVerificationTab: (email: string) => void;
	currentUser: User | null;
}) => {
	const id = useId();
	const [serverErrors, setServerErrors] = useState<
		Partial<Record<keyof SignUpInput, string>>
	>({});

	// États pour gérer la liaison de compte anonyme
	const [showLinkModal, setShowLinkModal] = useState(false);
	const [pendingEmailVerification, setPendingEmailVerification] = useState<{
		email: string;
		newUserId: string;
	} | null>(null);

	// Détecter si l'utilisateur actuel est anonyme
	const anonymousUserId = currentUser?.isAnonymous ? currentUser.id : null;

	const form = useAppForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			username: "",
			displayUsername: "",
		} satisfies SignUpInput as SignUpInput,
		validators: {
			onSubmit: signUpSchema,
			onBlur: signUpSchema,
		},
		onSubmit: async ({ value }) => {
			// Réinitialiser les erreurs serveur au début de la soumission
			setServerErrors({});

			const res = await signUp.email(
				{
					...value,
					callbackURL: "/",
				},
				{},
			);

			if (res.error) {
				const parsed = parseSignUpError(res.error);
				toast.error(parsed.message);
				logger.error("Erreur durant l'inscription", {
					message: res.error.message,
					parsedField: parsed.field,
				});
				if (parsed.field) {
					setServerErrors((prev) => ({
						...prev,
						[parsed.field as keyof SignUpInput]: parsed.message,
					}));
				}
				return;
			}

			if (res.data?.user) {
				await sendWelcomeEmailFn({
					data: {
						email: value.email,
						name: value.name,
					},
				});
				toast.success("Inscription réussie ! Bienvenue à bord !");

				if (anonymousUserId) {
					logger.info(
						"Anonymous user signed up, preparing to show link modal",
						{
							anonymousUserId,
							newUserId: res.data.user.id,
						},
					);
					setPendingEmailVerification({
						email: value.email,
						newUserId: res.data.user.id,
					});
					setShowLinkModal(true);
				}
			}

			form.reset();

			// Ne rediriger vers email verification que si ce n'est PAS un utilisateur anonyme
			// (pour les anonymes, on redirige après le choix dans la modal)
			if (res.data?.user && !res.data.user.emailVerified && !anonymousUserId) {
				openEmailVerificationTab(value.email);
			}
		},
	});

	return (
		<form
			id={`register-form-${id}`}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<FieldGroup>
				<form.AppField name="name">
					{(field) => (
						<field.Input
							label="Nom"
							description="Utilisé pour personnaliser vos emails de bienvenue"
							aria-invalid={!!serverErrors.name}
						/>
					)}
				</form.AppField>
				{serverErrors.name && (
					<p className="text-sm text-destructive">{serverErrors.name}</p>
				)}

				<form.AppField name="username">
					{(field) => (
						<field.UsernameInput
							label="Nom d'utilisateur"
							description="Utilisé lors de la connexion et dans votre profil"
							aria-invalid={!!serverErrors.username}
						/>
					)}
				</form.AppField>
				{serverErrors.username && (
					<p className="text-sm text-destructive">{serverErrors.username}</p>
				)}

				<form.AppField name="displayUsername">
					{(field) => (
						<field.DisplayUsernameInput
							label="Nom d'affichage"
							description="C'est le nom qui sera visible publiquement"
							aria-invalid={!!serverErrors.displayUsername}
						/>
					)}
				</form.AppField>
				{serverErrors.displayUsername && (
					<p className="text-sm text-destructive">
						{serverErrors.displayUsername}
					</p>
				)}

				<form.AppField name="email">
					{(field) => (
						<field.EmailInput
							label="Email"
							description="Pour recevoir des notifications et récupérer votre compte"
							aria-invalid={!!serverErrors.email}
						/>
					)}
				</form.AppField>
				{serverErrors.email && (
					<p className="text-sm text-destructive">{serverErrors.email}</p>
				)}

				<form.AppField name="password">
					{(field) => (
						<field.PasswordInput
							label="Mot de passe"
							description="Au moins 6 caractères"
							aria-invalid={!!serverErrors.password}
						/>
					)}
				</form.AppField>
				{serverErrors.password && (
					<p className="text-sm text-destructive">{serverErrors.password}</p>
				)}
			</FieldGroup>
			<form.Subscribe
				selector={(state) => ({
					isSubmitting: state.isSubmitting,
					isDirty: state.isDirty,
					values: state.values,
				})}
			>
				{({ isSubmitting, isDirty, values }) => (
					<Field orientation="horizontal">
						<ActionButton
							type="button"
							variant="outline"
							isPending={isSubmitting}
							onClick={() => form.reset()}
							disabled={isSubmitting || !isDirty}
						>
							Annuler
						</ActionButton>
						<ActionButton
							isPending={isSubmitting}
							disabled={
								!isDirty ||
								!signUpSchema.safeParse(values).success ||
								isSubmitting
							}
						>
							S'inscrire
						</ActionButton>
					</Field>
				)}
			</form.Subscribe>

			{/* Modal de liaison de compte anonyme */}
			{anonymousUserId && (
				<LinkAnonymousModal
					isOpen={showLinkModal}
					onClose={() => setShowLinkModal(false)}
					anonymousUserId={anonymousUserId}
					newUserId={pendingEmailVerification?.newUserId || null}
					onLinkSuccess={(count) => {
						logger.info("Anonymous account linked successfully", {
							linkedCount: count,
						});

						// Rediriger vers email verification après liaison réussie
						if (pendingEmailVerification) {
							openEmailVerificationTab(pendingEmailVerification.email);
							setPendingEmailVerification(null);
						}
					}}
					onLinkDecline={() => {
						logger.info("User declined anonymous account linking");

						// Rediriger vers email verification même si refus de liaison
						if (pendingEmailVerification) {
							openEmailVerificationTab(pendingEmailVerification.email);
							setPendingEmailVerification(null);
						}
					}}
				/>
			)}
		</form>
	);
};
