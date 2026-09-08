import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/data/env/server";
import * as schema from "@/db/schema";

const client = postgres(env.DATABASE_URL, {
	max: 10,
 connection: { search_path: env.DB_SCHEMA },
	connect_timeout: 30,
});

export const db = drizzle(client, { schema });
