/**
 * Logger serveur Winston (Node.js uniquement)
 *
 * ⚠️ N'importez JAMAIS ce fichier côté client !
 * Pour le client, utilisez @/lib/logger
 *
 * @example Utilisation serveur
 * ```ts
 * import { logger, withMeta, logError } from '@/lib/logger/server';
 *
 * logger.info('Server started');
 * logger.error('Database connection failed', { error });
 *
 * const requestLogger = withMeta({ requestId: '123' });
 * requestLogger.info('Processing request');
 * ```
 */

// Contexte AsyncLocalStorage
export {
	asyncLocalStorage,
	getContext,
	getCorrelationId,
	getUserId,
	type LogContext,
	runWithContext,
	updateContext,
} from "./context";
export type { Logger } from "./logger-pino";
// Re-export tout depuis le logger Pino (Bun-compatible)
export { logError, logger, withMeta } from "./logger-pino";

// Middleware TanStack Start
export {
	enrichLogContextWithUser,
	getContextLogger,
	type LoggingContext,
	loggingMiddleware,
} from "./middleware";
