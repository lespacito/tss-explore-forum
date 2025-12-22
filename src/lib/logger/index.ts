/**
 * Logger centralisé pour l'application
 *
 * Côté client : utilise un logger console simple
 * Côté serveur : utiliser @/lib/logger/server directement
 *
 * @example Usage côté client
 * ```ts
 * import { logger } from '@/lib/logger';
 * logger.info('User clicked button');
 * logger.error('Failed to load data', error);
 * ```
 *
 * @example Usage côté serveur
 * ```ts
 * import { logger } from '@/lib/logger/server';
 * logger.info('Server started', { port: 3000 });
 * ```
 */

// Export par défaut : logger client (safe pour browser)
export { logger } from "./client-logger";

// Re-export des types pour compatibilité
export type { Logger } from "./logger";
