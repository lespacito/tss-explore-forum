import arcjetClient, { shield } from "@arcjet/node";

/**
 * Client Arcjet de base avec configuration minimale
 * Toutes les règles spécifiques sont ajoutées via .withRule() dans les policies
 */
export const arcjet = arcjetClient({
	key: process.env.ARCJET_KEY || "",
	rules: [
		// Shield actif en production pour bloquer les attaques courantes
		shield({ mode: "LIVE" }),
	],
	// Caractéristique par défaut : identifie l'utilisateur par son ID ou son IP
	characteristics: ["userIdOrIp"],
});
