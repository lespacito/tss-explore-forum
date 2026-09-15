import { defineConfig } from "drizzle-kit";
import { z } from "zod";
import {
	buildDatabaseUrl,
	databaseEnvironment,
} from "./src/data/env/database";

const databaseEnv = z.object(databaseEnvironment).parse(process.env);

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: buildDatabaseUrl(databaseEnv),
	},
});
