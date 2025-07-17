import { useGenId } from "@elllphnt/elementa-base";
import * as diff from "diff";
import { join } from "path";
import { denormalizeComponentFunction } from "~/generators/component/denormalization/denormalize.js";
import { normalizeComponentFunction } from "../../src/parsers/component/normalization/component/component.js";
import {
  createTestProject,
  formatCode,
  getComponentFromSourceFile,
  getDirname,
  readComponentCode,
  runTestSuite,
  stripEmptylines,
  writeFile,
} from "../utils/index.js";

const __dirname = getDirname(import.meta.url);

function makeGenId(seed: number = 1) {
  let state = seed;

  return () => {
    // Constants from Lehmer RNG
    state = (state * 48271) % 0x7fffffff;
    const next = state / 0x7fffffff;
    return next.toString(36).substring(2, 12); // Convert to base-36 string
  };
}

async function testComponent(filename: string) {
  const project = createTestProject();
  const outputPath = join(__dirname, "output", filename);

  const componentCode = readComponentCode(__dirname, filename);

  const sourceFile = project.createSourceFile("test.tsx", componentCode);
  const componentFunction = getComponentFromSourceFile(sourceFile);

  useGenId(makeGenId());
  normalizeComponentFunction(componentFunction);
  const normalizedCode = await formatCode(componentFunction.getText());

  useGenId(makeGenId());
  denormalizeComponentFunction(componentFunction);
  const denormalizedCode = await formatCode(componentFunction.getText());

  useGenId(makeGenId());
  normalizeComponentFunction(componentFunction);
  const renormalizedCode = await formatCode(componentFunction.getText());

  const outputCode = [
    "/* eslint-disable */\n// @ts-nocheck",
    "// Source code",
    componentCode,
    "// Normalized code",
    normalizedCode,
    "// Denormalized code",
    denormalizedCode,
    "// Renormalized code",
    renormalizedCode,
  ].join("\n\n");

  writeFile(outputPath, outputCode);

  if (stripEmptylines(renormalizedCode) !== stripEmptylines(normalizedCode)) {
    console.error(`\n❌ Renormalization failed for ${filename}:`);

    const strippedNormalized = stripEmptylines(normalizedCode);
    const strippedRenormalized = stripEmptylines(renormalizedCode);

    const differences = diff.diffLines(
      strippedNormalized,
      strippedRenormalized,
    );

    console.error("\nDifferences:");
    differences.forEach((part) => {
      if (part.added) {
        console.error(
          `+ ${part.value
            .split("\n")
            .filter((line) => line.trim())
            .join("\n+ ")}`,
        );
      } else if (part.removed) {
        console.error(
          `- ${part.value
            .split("\n")
            .filter((line) => line.trim())
            .join("\n- ")}`,
        );
      }
    });

    throw new Error(`Renormalization failed for ${filename}: code mismatch`);
  }
}

// Main script
async function main() {
  await runTestSuite(__dirname, testComponent);
}

// Run the main script
main();
