import type { PluginOption } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }) as PluginOption,
    tailwindcss(),
    tanstackStart(),
    command === "build" && nitro({ preset: "bun" }),
    viteReact(),
  ],
  preview: {
    allowedHosts: ["parlonsviolence.ch", "www.parlonsviolence.ch"],
  },
  build: {
    rollupOptions: {
      maxParallelFileOps: 2,
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
}));
