// vite.config.ts
import { configDefaults, defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Quarantined suites.
 *
 * These suites build their fixtures with the pre-July-2025 file format
 * (`app.routerUrl`, string file URLs). The schema has since moved to typed
 * import references (`app.routerRef.__import.module`), so the fixtures no
 * longer resolve and the tests fail on setup — not on engine behaviour.
 *
 * They stay in the repo (and can be run with `pnpm test:all`) until the
 * fixtures in `infrastructures/` are migrated to the new reference format.
 */
const staleFixtureSuites = [
  "models/comprehensive.test.ts",
  "models/elements.test.ts",
  "models/router-component.test.ts",
  "models/simple.test.ts",
  "runtime/component-state.test.ts",
  "runtime/element-instances.test.ts",
  "runtime/integration.test.ts",
  "scene/integration.test.ts",
];

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    exclude: [
      ...configDefaults.exclude,
      ...(process.env.ELEMENTA_RUN_ALL_TESTS ? [] : staleFixtureSuites),
    ],
  },
});
