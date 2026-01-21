import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { protectAuthEndpoint } from "@/features/auth/lib/security/arcjet-policies";
import { logger } from "@/lib/logger/server";

/**
 * Server Function pour vérifier le rate limit avant tentative de connexion
 *
 * Story 1.5 - CRITICAL-3 Fix: Rate limiting Arcjet pour signin (NFR4, AC3)
 *
 * Cette fonction légère vérifie uniquement si l'utilisateur peut tenter
 * une connexion sans effectuer l'authentification complète.
 *
 * Utilisation:
 * - Appelée côté client avant signIn.username()
 * - Empêche les tentatives de brute-force (10 max / 10 min)
 * - Détecte les bots automatisés
 *
 * Sécurité (NFR4):
 * - Rate limiting: 10 tentatives max / 10 minutes
 * - Bot detection via Arcjet shield
 * - Logging des tentatives bloquées
 *
 * @see {@link protectAuthEndpoint} Pour la configuration Arcjet
 */
export const checkSignInRateLimit = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().min(1, "Username requis"),
    }),
  )
  .handler(async ({ data, request }) => {
    try {
      // Vérifier avec Arcjet: Rate limiting + Bot detection
      const arcjetDecision = await protectAuthEndpoint({
        request: request as unknown as Request,
        path: "/api/auth/signin-check",
      });

      // Si bloqué par Arcjet
      if (arcjetDecision.isDenied()) {
        if (arcjetDecision.reason.isRateLimit()) {
          logger.warn("Signin rate limit check: blocked", {
            username: data.username.substring(0, 3) + "***",
            ip: arcjetDecision.ip,
            reason: "RATE_LIMIT",
          });

          return {
            allowed: false,
            reason: "Trop de tentatives. Réessayez dans 10 minutes.",
            code: "RATE_LIMITED",
          };
        }

        if (arcjetDecision.reason.isBot()) {
          logger.warn("Signin rate limit check: bot detected", {
            username: data.username.substring(0, 3) + "***",
            ip: arcjetDecision.ip,
            reason: "BOT_DETECTED",
          });

          return {
            allowed: false,
            reason: "Accès refusé",
            code: "BOT_DETECTED",
          };
        }

        // Autre raison de blocage
        logger.warn("Signin rate limit check: blocked", {
          username: data.username.substring(0, 3) + "***",
          ip: arcjetDecision.ip,
          reason: arcjetDecision.reason.toString(),
        });

        return {
          allowed: false,
          reason: "Accès temporairement refusé",
          code: "BLOCKED",
        };
      }

      // Autorisé - peut procéder à la connexion
      logger.debug("Signin rate limit check: allowed", {
        username: data.username.substring(0, 3) + "***",
        ip: arcjetDecision.ip,
      });

      return {
        allowed: true,
        code: "ALLOWED",
      };
    } catch (error: any) {
      // En cas d'erreur Arcjet, on fail open (permet la connexion)
      // pour ne pas bloquer les utilisateurs légitimes
      logger.error("Signin rate limit check error", {
        error: error.message,
        username: data.username.substring(0, 3) + "***",
      });

      // Fail open: autoriser en cas d'erreur
      return {
        allowed: true,
        code: "ERROR_FAIL_OPEN",
      };
    }
  });
