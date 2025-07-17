import { join } from "path";
import { normalizeComponentFunction } from "../../src/parsers/component/normalization/component/component.js";
import {
  createTestProject,
  formatCode,
  getComponentFromSourceFile,
  getDirname,
  readComponentCode,
  runTestSuite,
  writeFile,
} from "../utils/index.js";

const __dirname = getDirname(import.meta.url);

async function testComponent(filename: string) {
  const project = createTestProject();
  const outputPath = join(__dirname, "output", filename);

  const componentCode = readComponentCode(__dirname, filename);

  const sourceFile = project.createSourceFile("test.tsx", componentCode);
  const componentFunction = getComponentFromSourceFile(sourceFile);

  // Apply normalize transformation
  normalizeComponentFunction(componentFunction);
  const normalizedCode = await formatCode(componentFunction.getText());

  const outputCode = [
    "/* eslint-disable */\n// @ts-nocheck",
    "// Source code",
    componentCode,
    "// Normalized code",
    normalizedCode,
  ].join("\n\n");

  writeFile(outputPath, outputCode);
}

// Main script
async function main() {
  await runTestSuite(__dirname, testComponent);
}

// Run the main script
main();
