import { createHash, createHmac, timingSafeEqual } from "node:crypto";

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
		a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
	);
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
	if (extra || !id || !expiry || !signature || !/^\d+$/.test(expiry))
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
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				c
			]!,
	);
function entryPage(
	message = "",
	status = 200,
	messageRole: "alert" | "status" = "alert",
) {
	return new Response(
		`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Accès à la bêta — Parlons Violence</title><link rel="stylesheet" href="/beta-entry.css"></head><body><main><h1>Bienvenue dans la bêta privée</h1><p>Ce test est réservé aux adultes invités en Suisse romande. Pour cette première cohorte, utilisez uniquement des scénarios fictifs.</p><p>Votre invitation donne accès à la lecture et au dépôt. Votre code secret personnel, reçu après le premier dépôt, sert ensuite à retrouver vos publications.</p>${message ? `<p role="${messageRole}">${escapeHtml(message)}</p>` : ""}<form action="/beta" method="post"><label for="invitation">Code d’invitation</label><input id="invitation" name="invitation" type="password" required maxlength="128" autocomplete="off" spellcheck="false"><button type="submit">Accéder à la bêta</button></form><p>Sans invitation, ou si votre code ne fonctionne plus, contactez la personne qui organise votre test.</p><nav><a href="/rules">Règles</a><a href="/privacy">Confidentialité</a><a href="/help">Aide et contact</a></nav></main></body></html>`,
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
// Bounded instance-wide limiter: no IP or invitation is kept in memory.
let windowStart = 0;
let attempts = 0;
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
					`${BETA_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
				);
			}
			if (url.searchParams.has("erased"))
				return entryPage(
					"Votre compte et vos publications ont été effacés de la base active. Une copie peut subsister jusqu’à sept jours supplémentaires dans une sauvegarde avant son expiration.",
					200,
					"status",
				);
			return entryPage(
				digests.length === 0 || secret.length < 32
					? "Les invitations ne sont pas encore ouvertes."
					: "",
			);
		}
		if (request.method !== "POST")
			return new Response(null, { status: 405, headers });
		if (request.headers.get("origin") !== url.origin)
			return entryPage("Rechargez la page avant de réessayer.", 403);
		if (Date.now() - windowStart > 60_000) {
			windowStart = Date.now();
			attempts = 0;
		}
		if (++attempts > 30)
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
			`${BETA_COOKIE}=${signInvitation(code, secret)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${lifetime}${secure}`,
		);
	}
	// These pages carry no participant content. Server functions are never exempted.
	if (
		request.method === "GET" &&
		["/help", "/privacy", "/rules"].includes(path)
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
