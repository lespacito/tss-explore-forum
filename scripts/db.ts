import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { UserRole } from "../src/db/schema";
import * as schema from "../src/db/schema";

const {
	DB_HOST,
	DB_PORT,
	DB_USER,
	DB_PASSWORD,
	DB_NAME,
	DB_SCHEMA = "public",
	DB_SSL,
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	console.error(
		"Missing required environment variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME",
	);
	process.exit(1);
}

const encodedUser = encodeURIComponent(DB_USER);
const encodedPassword = encodeURIComponent(DB_PASSWORD);
const sslParam = DB_SSL === "true" ? "?sslmode=require" : "";
const connectionString = `postgresql://${encodedUser}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}${sslParam}`;

const client = postgres(connectionString, {
	max: 10,
	connection: { search_path: DB_SCHEMA },
	connect_timeout: 30,
});

export const db = drizzle(client, { schema });

export async function getUserByEmail(email: string) {
	const rows = await db
		.select()
		.from(schema.user)
		.where(eq(schema.user.email, email))
		.limit(1);
	return rows[0] ?? null;
}

export async function setUserRole(id: string, role: UserRole) {
	const result = await db
		.update(schema.user)
		.set({ role })
		.where(eq(schema.user.id, id))
		.returning();
	return result[0] ?? null;
}

export async function closeDatabase(): Promise<void> {
	await client.end();
}
