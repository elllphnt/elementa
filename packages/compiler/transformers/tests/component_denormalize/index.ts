import { join } from "path";
import { denormalizeComponentFunction } from "~/compilers/denormalization/denormalize.js";
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

  // Apply denormalize transformation
  denormalizeComponentFunction(componentFunction);
  const denormalizedCode = await formatCode(componentFunction.getText());

  const outputCode = [
    "/* eslint-disable */\n// @ts-nocheck",
    "// Source code (normalized)",
    componentCode,
    "// Denormalized code",
    denormalizedCode,
  ].join("\n\n");

  writeFile(outputPath, outputCode);
}

// Main script
async function main() {
  await runTestSuite(__dirname, testComponent);
}

// Run the main script
main();
