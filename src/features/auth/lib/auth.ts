import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import { createPrimaryAlias } from "@/features/alias/lib/create-alias";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import { logger } from "@/lib/logger/server";
import { env } from "@/data/env/server";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 minute
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
              logger.info("Primary alias created", {
                userId,
                alias: alias.alias,
                path: ctx.path,
              });
            }
          } catch (error) {
            logger.error("Failed to create primary alias", {
              userId,
              path: ctx.path,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
            // Ne pas bloquer l'inscription si la création d'alias échoue
          }
        }
      }
    }),
  },
});
