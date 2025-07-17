import { join } from "path";
import { generateComponentModule } from "~/generators/component/module.js";
import {
  getDirname,
  readComponentCode,
  runTestSuite,
  writeFile,
} from "../utils/index.js";

const __dirname = getDirname(import.meta.url);

async function testComponent(filename: string) {
  const outputPath = join(
    __dirname,
    "output",
    filename.replace(/\.json$/, ".tsx"),
  );

  const componentCode = readComponentCode(__dirname, filename);
  const result = generateComponentModule(JSON.parse(componentCode));

  writeFile(outputPath, result);
}

// Main script
async function main() {
  await runTestSuite(__dirname, testComponent);
}

// Run the main script
main();
