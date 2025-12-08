import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config();

const url = new URL(process.env.DATABASE_URL!);
const isLocalHost = ["localhost", "127.0.0.1"].includes(url.hostname);

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  connect_timeout: 30,
  // Active l'SSL en prod si nécessaire
  ssl: isLocalHost ? undefined : "require",
});

export const db = drizzle(client, { schema });
