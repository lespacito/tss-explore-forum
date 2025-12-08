import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { createAuthMiddleware } from "better-auth/api";
import { db } from "@/db";
import { createPrimaryAlias } from "@/features/alias/lib/create-alias";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [username(), tanstackStartCookies()],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Hook pour créer automatiquement l'alias principal après inscription email ou OAuth
      if (ctx.path === "/sign-up/email" || ctx.path?.startsWith("/callback/")) {
        const newSession = ctx.context.newSession;

        if (newSession?.user) {
          const userId = newSession.user.id;

          try {
            // Vérifier si l'utilisateur a déjà un alias principal
            const existingAlias = await getPrimaryAlias(userId);

            if (!existingAlias) {
              const alias = await createPrimaryAlias(userId);
              console.log(
                `✅ Alias créé pour l'utilisateur ${userId}: ${alias.alias}`,
              );
            }
          } catch (error) {
            console.error(`❌ Erreur création alias pour ${userId}:`, error);
            // Ne pas bloquer l'inscription si la création d'alias échoue
          }
        }
      }
    }),
  },
});
