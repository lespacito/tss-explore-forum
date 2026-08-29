import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/features/auth/lib/auth";

export const getUserSessions = createServerFn({ method: "GET" }).handler(
	async () => {
		const request = getRequest();
		const sessions = await auth.api.listSessions({
			headers: request.headers,
		});
		return sessions;
	},
);
