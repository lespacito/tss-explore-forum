import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/lib/auth-middleware";

export const protectedAction = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		if (!context.isAuthenticated || !context.user) {
			throw new Error("Unauthorized");
		}

		return {
			message: `Hello ${context.user.name}, you are authenticated!`,
			email: context.user.email,
		};
	});
