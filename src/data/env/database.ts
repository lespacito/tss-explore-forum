import { z } from "zod";

export const databaseEnvironment = {
	DB_HOST: z.string().min(1),
	DB_SCHEMA: z
		.string()
		.regex(/^[a-z][a-z0-9_]*$/)
		.default("public"),
	DB_PORT: z.coerce.number().default(5432),
	DB_NAME: z.string().min(1),
	DB_USER: z.string().min(1),
	DB_PASSWORD: z.string().min(1),
	DB_SSL: z.enum(["true", "false"]).optional(),
};

type DatabaseEnvironment = z.infer<z.ZodObject<typeof databaseEnvironment>>;

export function buildDatabaseUrl({
	DB_HOST,
	DB_NAME,
	DB_PASSWORD,
	DB_PORT,
	DB_USER,
	DB_SSL,
}: DatabaseEnvironment) {
	const encodedUser = encodeURIComponent(DB_USER);
	const encodedPassword = encodeURIComponent(DB_PASSWORD);
	return `postgresql://${encodedUser}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}${
		DB_SSL === "true" ? "?sslmode=require" : ""
	}`;
}
