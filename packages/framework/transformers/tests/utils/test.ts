import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Get __dirname equivalent for ES modules
 */
export function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return dirname(__filename);
}

/**
 * Run tests on all files in an input directory
 */
export async function runTestSuite(
  testDir: string,
  testFunction: (filename: string) => Promise<void>,
): Promise<void> {
  const inputDir = join(testDir, "input");
  const files = readdirSync(inputDir);

  console.log(`Found ${files.length} test files in ${inputDir}`);

  for (const filename of files) {
    try {
      await testFunction(filename);
      console.log(`✅ ${filename} passed`);
    } catch (error) {
      console.error(
        `❌ ${filename} failed:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}

/**
 * Read component code from input file
 */
export function readComponentCode(testDir: string, filename: string): string {
  const sourcePath = join(testDir, "input", filename);
  return readFileSync(sourcePath, "utf8");
}
