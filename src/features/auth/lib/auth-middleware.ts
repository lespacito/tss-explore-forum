import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Session } from "better-auth";
import {
	mapAuthDataToUser,
	type User,
} from "@/features/auth/lib/map-auth-user";
import {
	enrichLogContextWithUser,
	getContextLogger,
} from "@/lib/logger/server";
import { auth } from "./auth";

function maskEmail(email: string): string {
	const atIndex = email.indexOf("@");
	if (atIndex <= 0) return "***";
	return `***${email.substring(atIndex)}`;
}

export type AuthContext = {
	user: User | null;
	isAuthenticated: boolean;
	session: Session | null;
};

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const logger = getContextLogger();
	const request = getRequest();

	try {
		const authData = await auth.api.getSession({
			headers: request.headers,
		});

		const session = authData?.session || null;
		const user = mapAuthDataToUser(authData);

		// Enrichir le contexte de log avec les infos utilisateur
		if (user) {
			enrichLogContextWithUser(
				user.id,
				user.username || user.name || undefined,
			);
			logger.debug("User authenticated", {
				userId: user.id,
				username: user.username,
				emailDomain: user.email ? maskEmail(user.email) : undefined,
			});
		}

		return await next({
			context: {
				user,
				isAuthenticated: !!session,
				session,
			} as AuthContext,
		});
	} catch (error) {
		logger.error("Auth middleware error", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}
});
