import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // `tests/<name>/index.ts` are fixture scripts run by hand, not suites.
    include: ["tests/**/*.test.ts"],
  },
});
