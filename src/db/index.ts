import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config();

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  connect_timeout: 30,
  // SSL configurable via variable d'environnement (défaut: désactivé sauf si explicite)
  ssl: process.env.DB_SSL === "true" ? "require" : undefined,
});

export const db = drizzle(client, { schema });
