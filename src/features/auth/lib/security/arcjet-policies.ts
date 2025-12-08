import { findIp } from "@arcjet/ip";
import {
	type ArcjetNodeRequest,
	type BotOptions,
	detectBot,
	type EmailOptions,
	protectSignup,
	type SlidingWindowRateLimitOptions,
	slidingWindow,
} from "@arcjet/node";
import { auth } from "@/features/auth/lib/auth";
import { arcjet } from "./arcjet-core";

/**
 * Context pour l'exécution d'une policy Arcjet
 */
export type ArcjetContext = {
	request: Request;
	path: string;
	email?: string;
};

/**
 * Presets de configuration pour les différentes règles Arcjet
 */
const botSettings: BotOptions = {
	mode: "LIVE",
	allow: ["CATEGORY:SEARCH_ENGINE"],
};

const restrictiveRateLimit: SlidingWindowRateLimitOptions<[]> = {
	mode: "LIVE",
	max: 10,
	interval: "10m",
};

const laxRateLimit: SlidingWindowRateLimitOptions<[]> = {
	mode: "LIVE",
	max: 60,
	interval: "1m",
};

const emailSettings: EmailOptions = {
	mode: "LIVE",
	block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
};

/**
 * Extrait les caractéristiques de base pour Arcjet
 * Utilise l'ID utilisateur si connecté, sinon l'IP
 */
async function getBaseCharacteristics(ctx: ArcjetContext) {
	const session = await auth.api.getSession({ headers: ctx.request.headers });
	let userIdOrIp = (session?.user.id ?? findIp(ctx.request)) || "127.0.0.1";

	// En développement, Arcjet a besoin d'une IP publique pour fonctionner correctement
	// On utilise une IP de test standard (TEST-NET-1) si on est en localhost
	if (process.env.NODE_ENV === "development" && userIdOrIp === "127.0.0.1") {
		userIdOrIp = "192.0.2.1";
	}

	return { userIdOrIp };
}

/**
 * Policy par défaut : protection bot + rate limit permissif
 * À utiliser sur les endpoints génériques (listes publiques, etc.)
 */
export async function protectDefault(ctx: ArcjetContext) {
	const { request } = ctx;
	const { userIdOrIp } = await getBaseCharacteristics(ctx);

	return arcjet
		.withRule(detectBot(botSettings))
		.withRule(slidingWindow(laxRateLimit))
		.protect(request as unknown as ArcjetNodeRequest, { userIdOrIp });
}

/**
 * Policy pour l'inscription : protection complète
 * - Validation email (anti-disposable, anti-invalid, anti-no-mx)
 * - Détection bot
 * - Rate limit restrictif
 */
export async function protectSignupEndpoint(ctx: ArcjetContext) {
	const { request, email } = ctx;
	const { userIdOrIp } = await getBaseCharacteristics(ctx);

	if (email) {
		return arcjet
			.withRule(
				protectSignup({
					email: emailSettings,
					bots: botSettings,
					rateLimit: restrictiveRateLimit,
				}),
			)
			.protect(request as unknown as ArcjetNodeRequest, { email, userIdOrIp });
	}

	// Fallback si email pas encore connu (ne devrait pas arriver dans le flow normal)
	return arcjet
		.withRule(detectBot(botSettings))
		.withRule(slidingWindow(restrictiveRateLimit))
		.protect(request as unknown as ArcjetNodeRequest, { userIdOrIp });
}

/**
 * Policy pour les endpoints de connexion et d'authentification sensibles
 * Rate limit restrictif + détection bot
 */
export async function protectAuthEndpoint(ctx: ArcjetContext) {
	const { request } = ctx;
	const { userIdOrIp } = await getBaseCharacteristics(ctx);

	return arcjet
		.withRule(detectBot(botSettings))
		.withRule(slidingWindow(restrictiveRateLimit))
		.protect(request as unknown as ArcjetNodeRequest, { userIdOrIp });
}

/**
 * Exécute la policy Arcjet appropriée selon le path
 */
export async function runArcjetPolicy(ctx: ArcjetContext) {
	switch (ctx.path) {
		case "/auth/sign-up":
			return protectSignupEndpoint(ctx);
		case "/auth/sign-in":
		case "/auth/reset-password":
		case "/auth/change-password":
			return protectAuthEndpoint(ctx);
		default:
			return protectDefault(ctx);
	}
}
