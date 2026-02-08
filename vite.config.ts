import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro({ preset: "node" }),
    // Workaround for TanStack Start virtual module issue
    {
      name: 'tanstack-start-virtual-module-fix',
      resolveId(id) {
        if (id === 'tanstack-start-injected-head-scripts:v') {
          return id;
        }
      },
      load(id) {
        if (id === 'tanstack-start-injected-head-scripts:v') {
          return 'export const injectedHeadScripts = "";';
        }
      },
    },
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
  ssr: {
    // Externaliser react et react-dom pour éviter les erreurs de bundling SSR
    external: ['react', 'react-dom'],
    // Ne pas bundler react-dom dans le server build
    noExternal: [],
  },
});

export default config;
