import { defineNitroConfig } from 'nitro/config';

export default defineNitroConfig({
  preset: 'node',

  // Externaliser react et react-dom pour éviter les erreurs de bundling
  externals: {
    inline: [],
  },

  // Ne pas bundler ces modules
  alias: {},

  rollupConfig: {
    external: ['react', 'react-dom', 'react-dom/server', 'react-dom/server.node'],
  },
});
