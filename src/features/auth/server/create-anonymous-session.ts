import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/features/auth/lib/auth";
import { logger } from "@/lib/logger/server";

export const createAnonymousSessionFn = createServerFn({
	method: "POST",
}).handler(async () => {
	const request = getRequest();
	try {
		const existing = await auth.api.getSession({ headers: request.headers });
		if (existing?.user) return { success: true, userId: existing.user.id };
		const session = await auth.api.signInAnonymous({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			throw new Error("Failed to create anonymous session");
		}

		logger.info("Anonymous session created", {
			userId: session.user.id,
		});

		return { success: true, userId: session.user.id };
	} catch (error) {
		// Log detailed error server-side only
		logger.error("Anonymous session creation failed", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		// Return generic client-safe message (never expose internal details)
		return {
			success: false,
			error: "Impossible de créer une session. Veuillez réessayer.",
		};
	}
});
