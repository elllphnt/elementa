import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/elementa": "http://localhost:3456",
    },
    headers: {
      "Origin-Agent-Cluster": "?0",
    },
  },

  // resolve: {
  //   alias: {
  //     "react": "https://esm.sh/react@18.2.0",
  //     "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
  //     "react-dom": "https://esm.sh/react-dom@18.2.0",
  //     "react-dom/": "https://esm.sh/react-dom@18.2.0/",
  //     "react-input-autosize": "https://esm.sh/react-input-autosize@3.0.0",
  //     "typescript": "https://esm.sh/typescript@5.5.3",
  //     "@babel/standalone": "https://esm.sh/@babel/standalone@7.24.7",
  //     "@babel/types": "https://esm.sh/@babel/types@7.24.7",
  //   },
  // },
  plugins: [react(), tsconfigPaths()],
  // optimizeDeps: {
  //   exclude: ["@elllphnt/elll-element"],
  // },
  build: {
    target: "esnext", //browsers can handle the latest ES features
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
});
