import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DB_HOST: z.string().min(1),
		DB_PORT: z.coerce.number().default(5432),
		DB_NAME: z.string().min(1),
		DB_USER: z.string().min(1),
		DB_PASSWORD: z.string().min(1),
		DB_SSL: z.enum(["true", "false"]).optional(),

		// Auth
		BETTER_AUTH_URL: z.string().url().optional(),
		BETTER_AUTH_SECRET: z.string().min(1),

		// OAuth GitHub
		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),
		// OAuth Google
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),

		// Emails - Resend
		RESEND_API_KEY: z.string().min(1),
		EMAIL_FROM: z.string().email(),
		EMAIL_REPLY_TO: z.string().email().optional(),

		// Divers
		APP_URL: z.string().min(1).default("http://localhost:3000"),
		ARCJET_KEY: z.string().min(1),

		// Logging
		LOG_LEVEL: z
			.enum(["error", "warn", "info", "http", "debug", "verbose", "silly"])
			.optional(),
		LOG_DIR: z.string().optional(),
		SERVICE_NAME: z.string().default("parlons-violence"),
	},
	createFinalSchema: (env) => {
		return z.object(env).transform((val) => {
			const {
				DB_HOST,
				DB_NAME,
				DB_PASSWORD,
				DB_PORT,
				DB_USER,
				DB_SSL,
				...rest
			} = val;
			const encodedUser = encodeURIComponent(DB_USER);
			const encodedPassword = encodeURIComponent(DB_PASSWORD);
			return {
				...rest,
				DATABASE_URL: `postgresql://${encodedUser}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}${
					DB_SSL === "true" ? "?sslmode=require" : ""
				}`,
			};
		});
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env,
});
