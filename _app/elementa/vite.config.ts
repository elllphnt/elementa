import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        "index": fileURLToPath(new URL("./index.html", import.meta.url)),
        "editor": fileURLToPath(new URL("./editor.html", import.meta.url)),
        "viewer": fileURLToPath(new URL("./viewer.html", import.meta.url)),
        "module-host": fileURLToPath(
          new URL("./src/workers/module_host/main.ts", import.meta.url)
        ),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "module-host") return "module-host.js";
          return "[name]-[hash].js";
        },
      },
    },
  },
});
