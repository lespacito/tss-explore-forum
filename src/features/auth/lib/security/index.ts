/**
 * Point d'entrée centralisé pour tous les modules de sécurité
 * Simplifie les imports dans le reste de l'application
 */

// Client Arcjet de base
export { arcjet } from "./arcjet-core";

// Policies et context types
export {
	type ArcjetContext,
	protectAuthEndpoint,
	protectDefault,
	protectSignupEndpoint,
	runArcjetPolicy,
} from "./arcjet-policies";

// Helper pour créer des serverFns protégées
export {
	type ArcjetPolicyConfig,
	checkArcjet,
	createAuthDeniedHandler,
	handleArcjetDenied,
} from "./protected-server-fn";
