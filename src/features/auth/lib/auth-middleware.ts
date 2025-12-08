import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { Session } from "better-auth";
import type { InferSelectModel } from "drizzle-orm";
import type { user } from "@/db/schema";
import { auth } from "./auth";

export type User = InferSelectModel<typeof user>;

export type AuthContext = {
	user: User | null;
	isAuthenticated: boolean;
	session: Session | null;
};

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const request = getRequest();
	const authData = await auth.api.getSession({
		headers: request.headers,
	});

	const session = authData?.session || null;
	const user = authData?.user
		? ({
				id: authData.user.id,
				email: authData.user.email,
				name: authData.user.name,
				image: authData.user.image,
				emailVerified: authData.user.emailVerified,
				createdAt: authData.user.createdAt,
				updatedAt: authData.user.updatedAt,
				username: authData.user.username,
				displayUsername: authData.user.displayUsername,
			} as User)
		: null;

	return await next({
		context: {
			user,
			isAuthenticated: !!session,
			session,
		} as AuthContext,
	});
});
