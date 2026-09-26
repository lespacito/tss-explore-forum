import { createHmac } from "node:crypto";

const WINDOW_MS = 60_000;
const MAX_SUBMISSIONS = 3;

const clients = new Map<string, { count: number; expiresAt: number }>();
const keySecret = new Uint8Array(32);
crypto.getRandomValues(keySecret);

function hashBetaCookie(cookieValue: string): string {
	return createHmac("sha256", keySecret).update(cookieValue).digest("hex");
}

/**
 * Extrait et valide le cookie beta, retourne le hash HMAC ou null si absent/invalide.
 * Ne stocke ni ne loggue le cookie brut ou son hash.
 */
export function extractBetaHash(request: Request): string | null {
	const cookieHeader = request.headers.get("cookie") ?? "";
	const betaCookie = cookieHeader
		.split(";")
		.map((s) => s.trim())
		.find((s) => s.startsWith("pv-beta-access="));

	if (!betaCookie) return null;

	const value = betaCookie.slice("pv-beta-access=".length);
	if (value.length < 64 || value.length > 200) return null;

	return hashBetaCookie(value);
}

export function checkRateLimit(request: Request): { allowed: boolean; reason?: string } {
	const key = extractBetaHash(request);
	if (!key) {
		return { allowed: false, reason: "Pas de cookie beta valide" };
	}

	const now = Date.now();

	if (clients.size >= 500) {
		let oldest: string | undefined;
		for (const k of clients.keys()) {
			if (oldest === undefined || clients.get(k)!.expiresAt < clients.get(oldest)!.expiresAt) {
				oldest = k;
			}
		}
		if (oldest) clients.delete(oldest);
	}

	const existing = clients.get(key);
	if (!existing || existing.expiresAt <= now) {
		clients.set(key, { count: 1, expiresAt: now + WINDOW_MS });
		return { allowed: true };
	}

	existing.count += 1;
	existing.expiresAt = now + WINDOW_MS;

	if (existing.count > MAX_SUBMISSIONS) {
		return { allowed: false, reason: "Trop de soumissions. Réessayez dans une minute." };
	}

	return { allowed: true };
}

/**
 * LIMITES DU RATE-LIMIT (documentation interne)
 *
 * - Stockage en mémoire (Map) : les compteurs sont perdus au redémarrage du serveur.
 * - Clé secrète régénérée à chaque démarrage : les buckets sont réinitialisés.
 * - Mono-instance : dans un déploiement cluster/multi-instance, chaque instance
 *   a son propre rate-limit indépendant. Contournable en répartissant les requêtes
 *   sur plusieurs instances.
 *
 * Ces limites sont acceptables pour la bêta (5–10 testeurs, déploiement Dokploy
 * local mono-instance). Si le déploiement évolue, préférer un stockage externe
 * (Redis, etc.) pour le rate-limit.
 */