import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
  build: {
    rollupOptions: {
      external: ["react", "react-dom", "react-dom/client"],
    },
  },
});
