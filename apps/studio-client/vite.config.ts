import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3500,
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "Origin-Agent-Cluster",
      configureServer: (server) => {
        server.middlewares.use((_, response, next) => {
          response.setHeader("Origin-Agent-Cluster", "?0");
          next();
        });
      },
    },
  ],
});
