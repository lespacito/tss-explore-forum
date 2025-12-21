/**
 * Contexte de logging avec AsyncLocalStorage
 * Permet de propager le correlationId à travers toute la chaîne d'exécution
 * sans le passer explicitement en paramètre
 */

import { AsyncLocalStorage } from "node:async_hooks";

export interface LogContext {
  correlationId?: string;
  userId?: string;
  username?: string;
  requestPath?: string;
  [key: string]: any;
}

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

/**
 * Exécute une fonction avec un contexte de logging
 *
 * @example
 * runWithContext({ correlationId: 'abc-123' }, () => {
 *   // Tout le code ici aura accès au correlationId
 *   const ctx = getContext();
 *   console.log(ctx.correlationId); // 'abc-123'
 * });
 */
export const runWithContext = <T>(context: LogContext, fn: () => T): T => {
  return asyncLocalStorage.run(context, fn);
};

/**
 * Récupère le contexte de logging actuel
 * Retourne un objet vide si aucun contexte n'est actif
 *
 * @example
 * const { correlationId, userId } = getContext();
 * logger.info('User action', { correlationId, userId });
 */
export const getContext = (): LogContext => {
  return asyncLocalStorage.getStore() || {};
};

/**
 * Met à jour le contexte actuel avec de nouvelles valeurs
 * Merge avec le contexte existant
 *
 * @example
 * updateContext({ userId: '123' });
 * // Le contexte contient maintenant correlationId ET userId
 */
export const updateContext = (updates: Partial<LogContext>): void => {
  const current = getContext();
  // Note: on ne peut pas vraiment mettre à jour le store existant,
  // mais on peut exposer cette fonction pour la cohérence
  // En pratique, utilisez runWithContext pour les sous-contextes
  Object.assign(current, updates);
};

/**
 * Récupère uniquement le correlationId du contexte
 */
export const getCorrelationId = (): string | undefined => {
  return getContext().correlationId;
};

/**
 * Récupère uniquement le userId du contexte
 */
export const getUserId = (): string | undefined => {
  return getContext().userId;
};

/**
 * Export du store pour usage avancé si nécessaire
 */
export { asyncLocalStorage };
