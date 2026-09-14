import { describe, expect, it } from "vitest";
import { buildDatabaseUrl } from "../database";

describe("database environment", () => {
	it("builds and safely encodes the PostgreSQL URL", () => {
		expect(
			buildDatabaseUrl({
				DB_HOST: "postgres",
				DB_PORT: 5432,
				DB_NAME: "forum",
				DB_USER: "user@example.com",
				DB_PASSWORD: "secret/with+symbols",
				DB_SCHEMA: "public",
				DB_SSL: "true",
			}),
		).toBe(
			"postgresql://user%40example.com:secret%2Fwith%2Bsymbols@postgres:5432/forum?sslmode=require",
		);
	});
});
