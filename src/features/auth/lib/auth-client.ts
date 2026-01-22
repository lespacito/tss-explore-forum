import { env } from "@/data/env/client";
import {
  usernameClient,
  adminClient,
  anonymousClient,
} from "better-auth/client/plugins";
import { credentialsClient } from "better-auth-credentials-plugin/client";
import { createAuthClient } from "better-auth/react";

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
