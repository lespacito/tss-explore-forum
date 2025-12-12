import arcjetClient, { shield } from "@arcjet/node";

/**
 * Client Arcjet de base avec configuration minimale
 * Toutes les règles spécifiques sont ajoutées via .withRule() dans les policies
 */

const key = process.env.ARCJET_KEY || "";
// Force DRY_RUN si clé de dev ou environnement non-prod
const isDevKey = key.startsWith("ajkey_dev_");
const isProd = process.env.NODE_ENV === "production";

export const ARCJET_MODE = isDevKey || !isProd ? "DRY_RUN" : "LIVE";

export const arcjet = arcjetClient({
	key,
	rules: [
		// Shield actif en production, DRY_RUN en dev pour éviter les blocages intempestifs
		shield({ mode: ARCJET_MODE }),
	],
	// Caractéristique par défaut : identifie l'utilisateur par son ID ou son IP
	characteristics: ["userIdOrIp"],
});
