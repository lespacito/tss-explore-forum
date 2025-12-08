import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/features/auth/lib/auth-middleware";

export const getAuthSession = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context;
	});
