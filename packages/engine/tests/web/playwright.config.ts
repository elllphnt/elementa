// playwright.config.ts
import { defineConfig } from "@playwright/experimental-ct-react";

export default defineConfig({
  testDir: "./tests", // or wherever your tests live
  use: {
    ctPort: 3100,
    headless: true,
  },
});
