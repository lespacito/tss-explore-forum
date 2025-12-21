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
    BETTER_AUTH_SECRET: z.string().min(1),

    // OAuth GitHub
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    // OAuth Google
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    // SMTP / Emails
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().default(1025),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().min(1).default("noreply@forum.local"),
    SMTP_REPLY_TO: z.string().optional(),

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
        DATABASE_URL: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}${
          DB_SSL === "true" ? "?sslmode=require" : ""
        }`,
      };
    });
  },
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
});
