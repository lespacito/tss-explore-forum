/**
 * Point d'entrée centralisé pour tous les modules de sécurité
 * Simplifie les imports dans le reste de l'application
 */

// Client Arcjet de base
export { arcjet } from "./arcjet-core";

// Policies et context types
export {
  protectDefault,
  protectSignupEndpoint,
  protectAuthEndpoint,
  runArcjetPolicy,
  type ArcjetContext,
} from "./arcjet-policies";

// Helper pour créer des serverFns protégées
export {
  checkArcjet,
  handleArcjetDenied,
  createAuthDeniedHandler,
  type ArcjetPolicyConfig,
} from "./protected-server-fn";
