import type { User } from "better-auth";
import {
	adminClient,
	anonymousClient,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { credentialsClient } from "better-auth-credentials-plugin/client";
import { z } from "zod";
import { env } from "@/data/env/client";

const secretCodeSchema = z.object({
	secretCode: z.string(),
});

export const authClient = createAuthClient({
	baseURL: env.VITE_BETTER_AUTH_URL,
	redirectTo: "/",
	plugins: [
		usernameClient(),
		anonymousClient(),
		adminClient(),
		credentialsClient<User, "/sign-in/credentials", typeof secretCodeSchema>(),
	],
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;
