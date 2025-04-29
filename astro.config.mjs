// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["react-dom/server", "react-dom/client"],
      noExternal: ["@astrojs/react"],
    },
    build: {
      minify: false, // Helps with debugging
    },
  },
  adapter: cloudflare({
    imageService: "passthrough", // Use passthrough for better compatibility
    platformProxy: {
      enabled: false, // Disable for production
    },
    routes: {
      extend: {
        // Add any static assets that should be served directly
        exclude: [{ pattern: "/assets/*" }],
      },
    },
  }),
  experimental: { session: true },
});
