import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	redirectTo: "/",
	plugins: [usernameClient()],
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;
