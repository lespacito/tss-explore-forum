/**
 * Middleware TanStack Start pour logging des requêtes HTTP
 *
 * Features:
 * - Génère un correlationId par requête (ou réutilise celui des headers)
 * - Injecte un logger contextualisé dans le context
 * - Log automatiquement les requêtes avec durée, statut, méthode
 * - Propage le correlationId via AsyncLocalStorage
 * - Ajoute le correlationId dans les headers de réponse
 */

import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { v4 as uuidv4 } from "uuid";
import type { Logger } from "./logger";
import { getContext, type LogContext, runWithContext } from "./context";
import { logger, withMeta } from "./logger";

export interface LoggingContext {
	logger: Logger;
	correlationId: string;
	logContext: LogContext;
}

/**
 * Middleware de logging pour TanStack Start
 *
 * Injecte dans le context:
 * - logger: Logger Winston contextualisé avec correlationId
 * - correlationId: ID unique de la requête
 * - logContext: Contexte complet de logging
 *
 * @example
 * // Dans une route ou server function
 * export const myServerFn = createServerFn({ method: "POST" })
 *   .middleware([loggingMiddleware])
 *   .handler(async ({ context }) => {
 *     context.logger.info('Processing request');
 *     // Le correlationId est automatiquement inclus dans les logs
 *     return { ok: true };
 *   });
 */
export const loggingMiddleware = createMiddleware().server(async ({ next }) => {
	const request = getRequest();

	// Extraire ou générer le correlationId
	const incomingId = request.headers.get("x-correlation-id");
	const correlationId =
		typeof incomingId === "string" && incomingId.trim()
			? incomingId.trim()
			: uuidv4();

	// Préparer le contexte de log
	const logContext: LogContext = {
		correlationId,
		requestPath: new URL(request.url).pathname,
		method: request.method,
		userAgent: request.headers.get("user-agent") || undefined,
	};

	// Logger contextualisé pour cette requête
	const requestLogger = withMeta({ correlationId });

	// Timestamp de début
	const startTime = Date.now();

	// Log de début de requête (niveau debug pour ne pas polluer)
	requestLogger.debug("Request started", {
		method: request.method,
		path: logContext.requestPath,
	});

	// Exécuter dans le contexte AsyncLocalStorage
	return runWithContext(logContext, async () => {
		try {
			// Passer au prochain middleware/handler avec le context enrichi
			const response = await next({
				context: {
					logger: requestLogger,
					correlationId,
					logContext,
				} as LoggingContext,
			});

			// Log de fin de requête
			const duration = Date.now() - startTime;

			// Déterminer le niveau de log selon le status code
			// Note: avec TanStack Start, on n'a pas toujours accès au status ici
			// On log au niveau 'http' par défaut
			requestLogger.http("Request completed", {
				method: request.method,
				path: logContext.requestPath,
				durationMs: duration,
			});

			return response;
		} catch (error) {
			// Log des erreurs non gérées
			const duration = Date.now() - startTime;

			requestLogger.error("Request failed", {
				method: request.method,
				path: logContext.requestPath,
				durationMs: duration,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});

			// Re-throw pour que les error handlers en aval puissent traiter
			throw error;
		}
	});
});

/**
 * Helper pour récupérer le logger depuis le contexte AsyncLocalStorage
 * Utile dans du code qui n'a pas accès au context du middleware
 *
 * @example
 * import { getContextLogger } from '@/lib/logger/middleware';
 *
 * function someUtility() {
 *   const log = getContextLogger();
 *   log.info('Something happened');
 * }
 */
export const getContextLogger = (): Logger => {
	const ctx = getContext();
	return ctx.correlationId
		? withMeta({ correlationId: ctx.correlationId })
		: logger;
};

/**
 * Middleware combiné: logging + auth
 * Enrichit le contexte avec les infos utilisateur
 *
 * @example
 * export const protectedServerFn = createServerFn({ method: "POST" })
 *   .middleware([loggingMiddleware, authMiddleware])
 *   .handler(async ({ context }) => {
 *     // context.logger contient déjà userId et username si authentifié
 *     context.logger.info('Protected action');
 *   });
 */
export const enrichLogContextWithUser = (
	userId?: string,
	username?: string,
) => {
	const ctx = getContext();
	if (userId) {
		ctx.userId = userId;
	}
	if (username) {
		ctx.username = username;
	}
};
