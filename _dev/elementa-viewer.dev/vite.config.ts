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
      "rxjs": "https://esm.sh/rxjs@7.8.1",
      "react": "https://esm.sh/react@18.2.0",
      "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@18.2.0",
      "react-input-autosize": "https://esm.sh/react-input-autosize@3.0.0",
      "typescript": "https://esm.sh/typescript@5.5.3",
      "@babel/standalone": "https://esm.sh/@babel/standalone@7.24.7",
      "@babel/types": "https://esm.sh/@babel/types@7.24.7",
    },
  },
});
