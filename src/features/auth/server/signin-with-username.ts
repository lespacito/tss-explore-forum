import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/features/auth/lib/auth";
import { protectAuthEndpoint } from "@/features/auth/lib/security/arcjet-policies";
import { signInSchema } from "@/features/auth/schemas/sign-in-schema";
import { logger } from "@/lib/logger/server";

/**
 * Server Function pour la connexion avec username/password
 *
 * Story 1.5 - Task 2: Server function pour connexion avec Arcjet rate limiting
 *
 * Fonctionnalités:
 * - Validation avec Zod via signInSchema
 * - Rate limiting Arcjet (NFR4): 10 tentatives / 10 minutes
 * - Bot detection via Arcjet shield
 * - Appel Better-Auth pour authentification
 * - Gestion erreurs sécurisées (pas de révélation d'existence de compte)
 * - Détection email non vérifié
 *
 * Sécurité (NFR4):
 * - Rate limiting empêche brute-force attacks
 * - Messages d'erreur génériques (ne révèlent pas si user existe)
 * - Logging sécurisé (username partiel seulement)
 *
 * @see {@link signInSchema} Pour les règles de validation
 * @see {@link protectAuthEndpoint} Pour la configuration Arcjet
 */
export const signinWithUsernameFn = createServerFn({ method: "POST" })
	.validator(signInSchema)
	.handler(async ({ data }) => {
		const request = getRequest();
		try {
			// 1. Protection Arcjet: Rate limiting + Bot detection
			const arcjetDecision = await protectAuthEndpoint({
				request: request as unknown as Request,
				path: "/api/auth/signin",
			});

			// Bloquer si Arcjet détecte abus ou bot
			if (arcjetDecision.isDenied()) {
				if (arcjetDecision.reason.isRateLimit()) {
					logger.warn("Signin rate limited", {
						ip: arcjetDecision.ip,
						reason: "RATE_LIMIT",
					});

					return {
						success: false,
						error: "Trop de tentatives. Réessayez dans 10 minutes.",
						code: "RATE_LIMITED",
					};
				}

				if (arcjetDecision.reason.isBot()) {
					logger.warn("Signin blocked: bot detected", {
						ip: arcjetDecision.ip,
						reason: "BOT_DETECTED",
					});

					return {
						success: false,
						error: "Accès refusé",
						code: "BOT_DETECTED",
					};
				}

				// Autre raison de blocage
				logger.warn("Signin blocked by Arcjet", {
					ip: arcjetDecision.ip,
					reason: arcjetDecision.reason,
				});

				return {
					success: false,
					error: "Accès refusé",
					code: "BLOCKED",
				};
			}

			// 2. Appeler Better-Auth pour authentifier
			const result = await (auth.api as any).signIn.username({
				username: data.username,
				password: data.password,
				callbackURL: "/",
			});

			// Vérifier que Better-Auth a retourné un utilisateur
			if (!result || !result.user) {
				logger.warn("Signin failed: invalid credentials", {
					username: data.username.substring(0, 3) + "***", // Log partiel seulement
					ip: arcjetDecision.ip,
				});

				// Message générique pour ne pas révéler si le username existe
				return {
					success: false,
					error: "Nom d'utilisateur ou mot de passe incorrect",
					code: "INVALID_CREDENTIALS",
				};
			}

			// 3. Vérifier si l'email est vérifié
			if (!result.user.emailVerified) {
				logger.info("Signin blocked: email not verified", {
					userId: result.user.id,
					username: data.username,
				});

				return {
					success: false,
					error: "EMAIL_NOT_VERIFIED",
					code: "EMAIL_NOT_VERIFIED",
					userId: result.user.id,
					email: result.user.email,
				};
			}

			// 4. Succès
			logger.info("Signin successful", {
				userId: result.user.id,
				username: data.username,
			});

			return {
				success: true,
				userId: result.user.id,
				email: result.user.email,
				redirectTo: "/",
			};
		} catch (error: any) {
			// Logging sécurisé: ne jamais logger le mot de passe
			logger.error("Signin error", {
				error: error.message,
				stack: error.stack,
				username: data.username.substring(0, 3) + "***",
			});

			// NE JAMAIS révéler la raison exacte de l'échec
			// Message générique pour toutes les erreurs
			return {
				success: false,
				error: "Une erreur est survenue lors de la connexion",
				code: "INTERNAL_ERROR",
			};
		}
	});
