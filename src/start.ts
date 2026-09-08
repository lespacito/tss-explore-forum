import { createMiddleware, createStart } from "@tanstack/react-start";

const privateBeta = createMiddleware().server(async ({ request, next }) => {
	const { betaAccessResponse } = await import("@/features/beta/server/access");
	const blocked = await betaAccessResponse(request);
	if (blocked) return blocked;
	const result = await next();
	result.response.headers.set("Cache-Control", "private, no-store");
	result.response.headers.set("X-Robots-Tag", "noindex, nofollow");
	result.response.headers.set("Referrer-Policy", "no-referrer");
	return result;
});
export const startInstance = createStart(() => ({
	requestMiddleware: [privateBeta],
}));
