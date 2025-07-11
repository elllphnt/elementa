import { join } from "path";
import { parseComponentModule } from "~/parsers/component/module.js";
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
    filename.replace(/\.tsx$/, ".json"),
  );

  const componentCode = readComponentCode(__dirname, filename);
  const componentData = parseComponentModule(componentCode);

  writeFile(outputPath, JSON.stringify(componentData, null, 2));
}

// Main script
async function main() {
  await runTestSuite(__dirname, testComponent);
}

// Run the main script
main();
