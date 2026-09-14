import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { buildDatabaseUrl, databaseEnvironment } from "./database";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		...databaseEnvironment,

		// Auth
		BETTER_AUTH_URL: z.string().url().optional(),
		BETTER_AUTH_SECRET: z.string().min(1),

		// OAuth GitHub
		GITHUB_CLIENT_ID: z.string().min(1).optional(),
		GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
		// OAuth Google
		GOOGLE_CLIENT_ID: z.string().min(1).optional(),
		GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

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
			return {
				...rest,
				DATABASE_URL: buildDatabaseUrl({
					DB_HOST,
					DB_NAME,
					DB_PASSWORD,
					DB_PORT,
					DB_SCHEMA: val.DB_SCHEMA,
					DB_USER,
					DB_SSL,
				}),
			};
		});
	},
	emptyStringAsUndefined: true,
	runtimeEnv: process.env,
});
