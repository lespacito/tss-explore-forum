import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
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
      // Provide test environment variables for server-side tests
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://test:test@localhost:5432/test",
      ARCJET_KEY: process.env.ARCJET_KEY || "test_arcjet_key",
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET || "test_secret_32_chars_minimum_len",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      // Add other required env vars for tests
      NODE_ENV: "test",
    },
  },
});
