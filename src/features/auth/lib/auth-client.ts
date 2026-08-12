import {
	adminClient,
	anonymousClient,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { credentialsClient } from "better-auth-credentials-plugin/client";
import { env } from "@/data/env/client";

export const authClient = createAuthClient({
	baseURL: env.VITE_BETTER_AUTH_URL,
	redirectTo: "/",
	plugins: [
		usernameClient(),
		anonymousClient(),
		adminClient(),
		credentialsClient(),
	],
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;
