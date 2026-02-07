import { createServerFn } from "@tanstack/start";
import { auth } from "@/features/auth/lib/auth";
import { signupSchema } from "@/features/auth/schemas/signup-schema";
import { logger } from "@/lib/logger/server";

/**
 * Server Function pour l'inscription avec email/pseudonyme
 *
 * Story 1.4 - Task 3: Créer Server Function d'inscription
 *
 * Fonctionnalités:
 * - Validation avec Zod via signupSchema
 * - Normalisation email en lowercase
 * - Appel Better-Auth pour création compte
 * - Gestion erreurs: email/username déjà utilisés
 * - Retour structuré: success/error avec userId
 *
 * Better-Auth gère automatiquement:
 * - Hashing du password (bcrypt)
 * - Création du user en DB
 * - Envoi email de vérification
 * - Appel du hook after (création alias)
 *
 * @see {@link signupSchema} Pour les règles de validation
 */
export const signupWithEmailFn = createServerFn({ method: "POST" })
	.inputValidator(signupSchema)
	.handler(async ({ data }) => {
		try {
			// Normaliser l'email en lowercase (important pour unicité)
			const normalizedEmail = data.email.toLowerCase();

			// Appeler Better-Auth pour créer le compte
			// Déclenche automatiquement:
			// 1. Hash du password
			// 2. Insertion en DB
			// 3. Envoi email vérification (via emailVerification.sendOnSignUp)
			// 4. Hook after (création alias automatique)
			const result = await auth.api.signUp.email({
				email: normalizedEmail,
				password: data.password,
				username: data.username,
				callbackURL: "/auth/verify-email",
			});

			// Vérifier que Better-Auth a retourné un utilisateur
			if (!result || !result.user) {
				logger.error("Better-Auth returned null user", {
					email: normalizedEmail,
					username: data.username,
				});

				return {
					success: false,
					error: "Erreur lors de la création du compte",
				};
			}

			logger.info("User account created successfully", {
				userId: result.user.id,
				username: data.username,
				email: normalizedEmail,
			});

			// Retourner succès avec userId
			return {
				success: true,
				userId: result.user.id,
				requiresVerification: true,
			};
		} catch (error: any) {
			// Gestion des erreurs spécifiques de Better-Auth

			// Erreur: Email déjà utilisé
			if (error.message?.includes("email already exists")) {
				logger.warn("Signup failed: email already exists", {
					email: data.email.toLowerCase(),
				});

				return {
					success: false,
					error: "Cet email est déjà utilisé",
				};
			}

			// Erreur: Username déjà pris
			if (error.message?.includes("username already exists")) {
				logger.warn("Signup failed: username already exists", {
					username: data.username,
				});

				return {
					success: false,
					error: "Ce pseudonyme est déjà pris",
				};
			}

			// Erreur générique
			logger.error("Signup error", {
				error: error.message,
				stack: error.stack,
				username: data.username,
				email: data.email.toLowerCase(),
			});

			return {
				success: false,
				error: "Une erreur est survenue",
			};
		}
	});
