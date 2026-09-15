import {
	createHash,
	createHmac,
	randomBytes,
	timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";

export const BETA_COOKIE = "pv-beta-access";
const lifetime = 14 * 24 * 60 * 60;
export function invitationDigests(
	codes = process.env.BETA_INVITATION_CODES ?? "",
) {
	return codes
		.split(",")
		.map((code) => code.trim())
		.filter((code) => /^[A-Za-z0-9_-]{32,128}$/.test(code))
		.map(digest);
}
function digest(value: string) {
	return createHash("sha256").update(value).digest("hex");
}
function equal(a: string, b: string) {
	return (
		Buffer.byteLength(a) === Buffer.byteLength(b) &&
		timingSafeEqual(Buffer.from(a), Buffer.from(b))
	);
}
function expectedOrigin(requestUrl: string) {
	const configuredAppUrl = process.env.APP_URL?.trim();
	if (!configuredAppUrl) return new URL(requestUrl).origin;
	try {
		return new URL(configuredAppUrl).origin;
	} catch {
		return "";
	}
}
export function signInvitation(code: string, secret: string, now = Date.now()) {
	const payload = `${digest(code)}.${Math.floor(now / 1000) + lifetime}`;
	return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
export function verifyInvitation(
	cookie: string | undefined,
	digests: string[],
	secret: string,
	now = Date.now(),
) {
	if (!cookie || secret.length < 32 || cookie.length > 200) return false;
	const [id, expiry, signature, extra] = cookie.split(".");
	if (
		extra ||
		!/^[0-9a-f]{64}$/i.test(id ?? "") ||
		!/^\d+$/.test(expiry ?? "") ||
		!/^[0-9a-f]{64}$/i.test(signature ?? "")
	)
		return false;
	const seconds = Math.floor(now / 1000);
	if (
		+expiry <= seconds ||
		+expiry > seconds + lifetime ||
		!digests.includes(id)
	)
		return false;
	return equal(
		signature,
		createHmac("sha256", secret).update(`${id}.${expiry}`).digest("hex"),
	);
}
const headers = {
	"Cache-Control": "private, no-store",
	"X-Robots-Tag": "noindex, nofollow",
	"Referrer-Policy": "no-referrer",
};
function redirect(location: string, cookie?: string) {
	return new Response(null, {
		status: 303,
		headers: {
			...headers,
			Location: location,
			...(cookie ? { "Set-Cookie": cookie } : {}),
		},
	});
}
const escapeHtml = (value: string) =>
	value.replace(
		/[&<>"']/g,
		(c) =>
			(
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;",
				}) as Record<string, string>
			)[c] ?? c,
	);
function entryPage(
	message = "",
	status = 200,
	messageRole: "alert" | "status" = "alert",
	showInvitationForm = true,
) {
	const invitationForm = showInvitationForm
		? `<form action="/beta" method="post"><label for="invitation">Code d’invitation</label><input id="invitation" name="invitation" type="password" required maxlength="128" autocomplete="off" spellcheck="false"><button type="submit">Accéder à la bêta</button></form><p>Sans invitation, ou si votre code ne fonctionne plus, contactez la personne qui organise votre test.</p>`
		: "<p>Vous pouvez maintenant fermer cette page.</p>";
	const introduction = showInvitationForm
		? "<h1>Bienvenue dans la bêta privée</h1><p>Ce test est réservé aux adultes invités en Suisse romande. Pour cette première cohorte, utilisez uniquement des scénarios fictifs.</p><p>Votre code d’invitation ouvre le test. Après votre premier scénario, un code de récupération distinct vous permettra de retrouver vos scénarios.</p>"
		: "<h1>Vos données ont été effacées</h1>";
	return new Response(
		`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Accès à la bêta — Parlons Violence</title><link rel="stylesheet" href="/beta-entry.css"></head><body><main>${introduction}${message ? `<p role="${messageRole}">${escapeHtml(message)}</p>` : ""}${invitationForm}<nav><a href="/rules">Règles</a><a href="/privacy">Confidentialité</a><a href="/help">Aide et contact</a></nav></main></body></html>`,
		{
			status,
			headers: {
				...headers,
				"Content-Type": "text/html; charset=utf-8",
				"Referrer-Policy": "same-origin",
				"Content-Security-Policy":
					"default-src 'none'; style-src 'self'; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
			},
		},
	);
}
interface InvitationRateLimiterOptions {
	windowMs?: number;
	perClientLimit?: number;
	instanceLimit?: number;
	maxClients?: number;
	now?: () => number;
}

function clientIdentifier(request: Request) {
	const candidates = [
		request.headers.get("cf-connecting-ip"),
		request.headers.get("x-real-ip"),
		request.headers.get("x-forwarded-for")?.split(",")[0],
	];
	for (const candidate of candidates) {
		const address = candidate?.trim();
		if (address && address.length <= 64 && isIP(address)) return address;
	}
	return "unknown";
}

export function createInvitationRateLimiter({
	windowMs = 60_000,
	perClientLimit = 10,
	instanceLimit = 30,
	maxClients = 128,
	now = Date.now,
}: InvitationRateLimiterOptions = {}) {
	windowMs = Math.max(1, Math.floor(windowMs));
	perClientLimit = Math.max(1, Math.floor(perClientLimit));
	instanceLimit = Math.max(1, Math.floor(instanceLimit));
	maxClients = Math.max(1, Math.floor(maxClients));
	const clients = new Map<string, { attempts: number; expiresAt: number }>();
	const clientKeySecret = randomBytes(32);
	let instanceAttempts = 0;
	let instanceExpiresAt = 0;

	return (request: Request) => {
		const currentTime = now();
		if (currentTime >= instanceExpiresAt) {
			instanceAttempts = 0;
			instanceExpiresAt = currentTime + windowMs;
		}
		instanceAttempts += 1;
		if (instanceAttempts > instanceLimit) return true;

		for (const [key, value] of clients) {
			if (value.expiresAt <= currentTime) clients.delete(key);
		}

		const key = createHmac("sha256", clientKeySecret)
			.update(clientIdentifier(request))
			.digest("hex");
		const existing = clients.get(key);
		const entry = existing ?? {
			attempts: 0,
			expiresAt: currentTime + windowMs,
		};
		if (!existing) {
			while (clients.size >= maxClients) {
				const oldest = clients.keys().next().value;
				if (oldest === undefined) break;
				clients.delete(oldest);
			}
		}
		entry.attempts += 1;
		clients.delete(key);
		clients.set(key, entry);
		return entry.attempts > perClientLimit;
	};
}

// Raw client addresses and invitation values are never retained in memory.
const invitationRateLimited = createInvitationRateLimiter();
export async function betaAccessResponse(
	request: Request,
): Promise<Response | null> {
	const url = new URL(request.url);
	const path = url.pathname.replace(/\/$/, "") || "/";
	const digests = invitationDigests();
	const secret = process.env.BETTER_AUTH_SECRET ?? "";
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	if (path === "/beta") {
		if (request.method === "GET") {
			if (url.searchParams.has("leave")) {
				const erased = url.searchParams.get("leave") === "erased";
				return redirect(
					erased ? "/beta?erased=1" : "/beta",
					`${BETA_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
				);
			}
			if (url.searchParams.has("erased"))
				return entryPage(
					"Vos données et vos scénarios ont été effacés de la base active. Une copie peut subsister jusqu’à sept jours supplémentaires dans une sauvegarde avant son expiration.",
					200,
					"status",
					false,
				);
			return entryPage(
				digests.length === 0 || secret.length < 32
					? "Les invitations ne sont pas encore ouvertes."
					: "",
			);
		}
		if (request.method !== "POST")
			return new Response(null, { status: 405, headers });
		if (request.headers.get("origin") !== expectedOrigin(request.url))
			return entryPage("Rechargez la page avant de réessayer.", 403);
		if (invitationRateLimited(request))
			return entryPage("Trop de tentatives. Réessayez dans une minute.", 429);
		if (
			!request.headers
				.get("content-type")
				?.startsWith("application/x-www-form-urlencoded")
		)
			return entryPage("Formulaire non reconnu.", 400);
		// Read a bounded body even when content-length is omitted.
		const reader = request.body?.getReader();
		if (!reader) return entryPage("Saisissez votre code d’invitation.", 400);
		const chunks: Uint8Array[] = [];
		let size = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.length;
			if (size > 2048) {
				await reader.cancel();
				return entryPage("Code non reconnu.", 413);
			}
			chunks.push(value);
		}
		const form = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
		const code = (form.get("invitation") ?? "").trim();
		if (secret.length < 32 || !digests.includes(digest(code)))
			return entryPage(
				"Accès impossible. Vérifiez votre invitation auprès de l’organisateur.",
				403,
			);
		return redirect(
			"/",
			`${BETA_COOKIE}=${signInvitation(code, secret)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${lifetime}${secure}`,
		);
	}
	// These pages carry no participant content. Server functions are never exempted.
	if (
		["GET", "HEAD"].includes(request.method) &&
		["/beta-entry.css", "/help", "/privacy", "/rules"].includes(path)
	)
		return null;
	const cookie = request.headers
		.get("cookie")
		?.split(";")
		.map((s) => s.trim())
		.find((s) => s.startsWith(`${BETA_COOKIE}=`))
		?.slice(BETA_COOKIE.length + 1);
	if (verifyInvitation(cookie, digests, secret)) return null;
	if (
		request.method === "GET" &&
		request.headers.get("accept")?.includes("text/html")
	)
		return redirect("/beta");
	return new Response(
		JSON.stringify({
			error:
				"Une invitation valide est nécessaire. Revenez à la page d’accès à la bêta.",
		}),
		{
			status: 401,
			headers: { ...headers, "Content-Type": "application/json" },
		},
	);
}
