import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/data/env/server";

const client = postgres(env.DATABASE_URL!, {
  max: 10,
  connect_timeout: 30,
  // SSL configurable via variable d'environnement (défaut: désactivé sauf si explicite)
  ssl: env.DB_SSL === "true" ? "require" : undefined,
});

export const db = drizzle(client, { schema });
