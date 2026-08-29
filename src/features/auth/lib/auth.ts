import crypto from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin, anonymous, username } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { credentials } from "better-auth-credentials-plugin";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "@/data/env/server";
import { db } from "@/db";
import { account as accountTable, user as userTable } from "@/db/schemas/user";
import { createPrimaryAlias } from "@/features/alias/lib/create-alias";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import { findUserBySecretCode } from "@/features/auth/lib/find-user-by-code";
import { sendDeleteAccountVerificationEmail } from "@/features/auth/server/send-delete-account-verification-email";
import { sendPasswordResetEmail } from "@/features/auth/server/send-password-reset-email";
import { sendEmailVerificationEmail } from "@/features/auth/server/send-verification-email";
import { logger } from "@/lib/logger/server";

const secretCodeSchema = z.object({
	secretCode: z
		.string()
		.min(9, { message: "Le code secret est trop court" })
		.regex(/^[A-Z2-9]{4}-[A-Z2-9]{4}(-[A-Z2-9]{4})?$/, {
			message: "Format invalide",
		}),
});

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	user: {
		changeEmail: {
			enabled: true,
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }) => {
				await sendDeleteAccountVerificationEmail({ user, url });
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail({ user, url });
		},
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			// Ne pas envoyer d'emails de vérification aux utilisateurs anonymes
			if ((user as { isAnonymous?: boolean }).isAnonymous) {
				logger.info("Skipping verification email for anonymous user", {
					userId: user.id,
				});
				return;
			}
			await sendEmailVerificationEmail({ user, url });
		},
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
	plugins: [
		credentials<
			{
				id: string;
				email: string;
				name: string;
				image?: string | null;
				emailVerified: boolean;
				createdAt: Date;
				updatedAt: Date;
				isAnonymous?: boolean;
			},
			"/sign-in/credentials",
			typeof secretCodeSchema
		>({
			providerId: "secret-code",
			inputSchema: secretCodeSchema,
			linkAccountIfExisting: true, // Permet de lier un account à un user existant
			callback: async (ctx) => {
				const user = await findUserBySecretCode(ctx.body.secretCode);

				if (!user || !user.email) {
					logger.warn("Secret code not found or no email", {
						secretCode: ctx.body.secretCode,
					});
					return null;
				}

				logger.info("Secret code login - user found", {
					userId: user.id,
					email: user.email,
					isAnonymous: user.isAnonymous,
					emailVerified: user.emailVerified,
				});

				// Fallback: Vérifier que l'account existe, le créer sinon
				// Normalement créé lors de la génération du secret code, mais on assure la résilience
				const existingAccount = await db.query.account.findFirst({
					where: and(
						eq(accountTable.userId, user.id),
						eq(accountTable.providerId, "secret-code"),
					),
				});

				if (!existingAccount) {
					try {
						await db.insert(accountTable).values({
							id: crypto.randomUUID(),
							accountId: user.id,
							providerId: "secret-code",
							userId: user.id,
						});

						logger.info("Created secret-code account (fallback during login)", {
							userId: user.id,
						});
					} catch (error) {
						logger.error("Failed to create secret-code account", {
							userId: user.id,
							error: error instanceof Error ? error.message : String(error),
						});
					}
				}

				// Retourner l'ID et l'email - le plugin credentials gère la session
				return {
					id: user.id,
					email: user.email,
				};
			},
		}),
		username(),
		anonymous(),
		admin({
			defaultRole: "USER",
			adminRole: "ADMIN",
		}),
		tanstackStartCookies(),
	],
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const newSession = ctx.context.newSession;

			if (!newSession?.user) return;

			const userId = newSession.user.id;
			const isNewSession =
				ctx.path === "/sign-up/email" ||
				ctx.path?.startsWith("/callback/") ||
				newSession.user.isAnonymous === true;

			if (!isNewSession) return;

			// Auto-vérifier l'email et créer l'alias pour les utilisateurs anonymes
			if (newSession.user.isAnonymous) {
				try {
					await db
						.update(userTable)
						.set({ emailVerified: true })
						.where(eq(userTable.id, userId));

					logger.info("Auto-verified email for anonymous user", {
						userId,
					});
				} catch (error) {
					logger.error("Failed to auto-verify anonymous user email", {
						userId,
						error: error instanceof Error ? error.message : String(error),
					});
				}
			}

			// Créer l'alias principal pour tous les nouveaux utilisateurs
			try {
				const existingAlias = await getPrimaryAlias(userId);

				if (!existingAlias) {
					const alias = await createPrimaryAlias(userId);
					logger.info("Primary alias created", {
						userId,
						alias: alias.alias,
						path: ctx.path,
						isAnonymous: newSession.user.isAnonymous,
					});
				}
			} catch (error) {
				logger.error("Failed to create primary alias", {
					userId,
					path: ctx.path,
					isAnonymous: newSession.user.isAnonymous,
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
				});
			}
		}),
	},
});
