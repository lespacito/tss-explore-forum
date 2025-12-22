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

// Re-export tout depuis le logger Winston
export { logger, withMeta, logError } from "./logger";
export type { Logger } from "./logger";

// Contexte AsyncLocalStorage
export {
  getContext,
  getCorrelationId,
  getUserId,
  runWithContext,
  updateContext,
  asyncLocalStorage,
  type LogContext,
} from "./context";

// Middleware TanStack Start
export {
  loggingMiddleware,
  getContextLogger,
  enrichLogContextWithUser,
  type LoggingContext,
} from "./middleware";
