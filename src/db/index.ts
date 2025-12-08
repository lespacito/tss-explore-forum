import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config();

const client = postgres(process.env.DATABASE_URL!, {
	max: 10,
	connect_timeout: 30,
	// Active l'SSL en prod si nécessaire
	ssl: process.env.NODE_ENV === "production" ? "require" : undefined,
});

export const db = drizzle(client, { schema });
