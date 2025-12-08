import type { ArcjetDecision } from "@arcjet/node";
import { getRequest } from "@tanstack/react-start/server";
import { runArcjetPolicy } from "./arcjet-policies";

/**
 * Configuration pour une policy Arcjet
 */
export type ArcjetPolicyConfig = {
	/**
	 * Path de l'endpoint pour sélectionner la policy appropriée
	 * @example "/auth/sign-up"
	 */
	path: string;

	/**
	 * Email à valider (optionnel)
	 * Utilisé pour la validation d'email dans protectSignup
	 */
	email?: string;
};

/**
 * Exécute la protection Arcjet et retourne la décision
 * À appeler dans vos serverFns
 *
 * @example
 * ```typescript
 * export const signUpServerFn = createServerFn({ method: "POST" })
 *   .inputValidator(signUpSchema.parse)
 *   .handler(async ({ data }) => {
 *     const decision = await checkArcjet({
 *       path: "/auth/sign-up",
 *       email: data.email,
 *     });
 *
 *     if (decision.isDenied()) {
 *       return handleArcjetDenied(decision);
 *     }
 *
 *     // Votre logique métier ici
 *   });
 * ```
 */
export async function checkArcjet(
	config: ArcjetPolicyConfig,
): Promise<ArcjetDecision> {
	const request = getRequest();

	return runArcjetPolicy({
		request,
		path: config.path,
		email: config.email,
	});
}

/**
 * Handler standard pour gérer les refus Arcjet
 * Retourne un objet avec success: false et un message d'erreur approprié
 *
 * @example
 * ```typescript
 * const decision = await checkArcjet({ path: "/auth/sign-up" });
 * if (decision.isDenied()) {
 *   return handleArcjetDenied(decision);
 * }
 * ```
 */
export function handleArcjetDenied(decision: ArcjetDecision) {
	// Rate limit dépassé
	if (decision.reason?.isRateLimit?.()) {
		return {
			success: false as const,
			error: "Trop de tentatives. Veuillez réessayer plus tard.",
		};
	}

	// Bot détecté
	if (decision.reason?.isBot?.()) {
		return {
			success: false as const,
			error: "Accès refusé - Bot détecté",
		};
	}

	// Validation email échouée
	if (decision.reason?.isEmail?.()) {
		const types = decision.reason.emailTypes || [];

		if (types.includes("INVALID")) {
			return {
				success: false as const,
				error: "Le format de l'adresse email est invalide",
				field: "email" as const,
			};
		}

		if (types.includes("DISPOSABLE")) {
			return {
				success: false as const,
				error: "Les adresses email jetables ne sont pas autorisées",
				field: "email" as const,
			};
		}

		if (types.includes("NO_MX_RECORDS")) {
			return {
				success: false as const,
				error: "Le domaine de l'adresse email est invalide",
				field: "email" as const,
			};
		}

		return {
			success: false as const,
			error: "Adresse email invalide",
			field: "email" as const,
		};
	}

	// Cas par défaut
	return {
		success: false as const,
		error: "Accès refusé",
	};
}

/**
 * Alias pour handleArcjetDenied (pour compatibilité avec la doc)
 */
export const createAuthDeniedHandler = handleArcjetDenied;
