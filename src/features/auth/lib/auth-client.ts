import { env } from "@/data/env/client";
import {
  usernameClient,
  adminClient,
  anonymousClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
  redirectTo: "/",
  plugins: [usernameClient(), anonymousClient(), adminClient()],
});

export const { useSession, signIn, signOut, signUp, getSession } = authClient;
