import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Origin-Agent-Cluster": "?0",
      // "cache-control": "max-age=604800",
    },
  },
  resolve: {
    alias: {
      // "react": "https://esm.sh/react@19.0.0",
      // "react-dom": "https://esm.sh/react-dom@19.0.0",
      "typescript": "https://esm.sh/typescript@5.5.3",
      "@babel/standalone": "https://esm.sh/@babel/standalone@7.24.7",
      "@babel/types": "https://esm.sh/@babel/types@7.24.7",
    },
  },
});
