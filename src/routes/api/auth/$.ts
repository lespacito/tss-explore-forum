import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/features/auth/lib/auth";
import { runArcjetPolicy } from "@/features/auth/lib/security/arcjet-policies";
import { handleArcjetDenied } from "@/features/auth/lib/security/protected-server-fn";

async function handler({ request }: { request: Request }) {
	const url = new URL(request.url);
	const path = url.pathname;
	let email: string | undefined;

	// Map Better Auth paths to Arcjet policy paths
	let policyPath = path;
	if (path.includes("/sign-in")) policyPath = "/auth/sign-in";
	if (path.includes("/sign-up")) {
		policyPath = "/auth/sign-up";
		// Clone request to read body without consuming it for Better Auth
		try {
			const clone = request.clone();
			const body = await clone.json();
			email = body.email;
		} catch (e) {
			// Ignore body parsing errors
		}
	}

	const decision = await runArcjetPolicy({
		request,
		path: policyPath,
		email,
	});

	if (decision.isDenied()) {
		const result = handleArcjetDenied(decision);

		// Convert result to HTTP response
		const status = decision.reason.isRateLimit() ? 429 : 403;
		return new Response(JSON.stringify(result), {
			status,
			headers: { "Content-Type": "application/json" },
		});
	}
	return await auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
		},
	},
});
