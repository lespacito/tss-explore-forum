import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3001",
	redirectTo: "/",
	plugins: [usernameClient()],
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;
