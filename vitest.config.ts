import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		react() as any,
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}) as any,
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: [
			"**/*.e2e.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
			"**/*.manual.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
			"src/features/auth/__tests__/secret-code-security.test.ts",
			"src/features/auth/__tests__/signin-secret-code-performance.test.ts",
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"**/*.config.{js,ts}",
				"**/*.d.ts",
				"**/types/**",
			],
		},
		env: {
			DATABASE_URL:
				process.env.DATABASE_URL ||
				"******localhost:5432/test",
			ARCJET_KEY: process.env.ARCJET_KEY || "test_arcjet_key",
			BETTER_AUTH_SECRET:
				process.env.BETTER_AUTH_SECRET || "test_secret_32_chars_minimum_len",
			BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
			NODE_ENV: "test",
		},
	},
});
