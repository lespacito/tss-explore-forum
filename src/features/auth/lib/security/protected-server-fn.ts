import type { ArcjetDecision } from "@arcjet/node";
import { getRequest } from "@tanstack/react-start/server";
import { getContextLogger } from "@/lib/logger/server";
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
  const logger = getContextLogger();
  const request = getRequest();

  try {
    const decision = await runArcjetPolicy({
      request,
      path: config.path,
      email: config.email,
    });

    // Log la décision Arcjet
    if (decision.isDenied()) {
      logger.warn("Arcjet policy denied", {
        path: config.path,
        conclusion: decision.conclusion,
        reason: decision.reason?.toString(),
        ip: decision.ip,
      });
    } else {
      logger.debug("Arcjet policy allowed", {
        path: config.path,
        conclusion: decision.conclusion,
      });
    }

    return decision;
  } catch (error) {
    logger.error("Arcjet policy check failed", {
      path: config.path,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
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
  const logger = getContextLogger();

  // Rate limit dépassé
  if (decision.reason?.isRateLimit?.()) {
    logger.warn("Rate limit exceeded", {
      conclusion: decision.conclusion,
      ip: decision.ip,
    });
    return {
      success: false as const,
      error: "Trop de tentatives. Veuillez réessayer plus tard.",
    };
  }

  // Bot détecté
  if (decision.reason?.isBot?.()) {
    logger.warn("Bot detected", {
      conclusion: decision.conclusion,
      ip: decision.ip,
    });
    return {
      success: false as const,
      error: "Accès refusé - Bot détecté",
    };
  }

  // Validation email échouée
  if (decision.reason?.isEmail?.()) {
    const types = decision.reason.emailTypes || [];

    logger.warn("Email validation failed", {
      conclusion: decision.conclusion,
      emailTypes: types,
      ip: decision.ip,
    });

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
  logger.warn("Arcjet denied for unknown reason", {
    conclusion: decision.conclusion,
    reason: decision.reason?.toString(),
    ip: decision.ip,
  });

  return {
    success: false as const,
    error: "Accès refusé",
  };
}

/**
 * Alias pour handleArcjetDenied (pour compatibilité avec la doc)
 */
export const createAuthDeniedHandler = handleArcjetDenied;
