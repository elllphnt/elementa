import { isValidFileType } from "@elllphnt/elementa-base";
import { compileResource } from "@elllphnt/elementa-compiler";
import { parseResource } from "@elllphnt/elementa-parser";
import { standardizeResource } from "@elllphnt/elementa-standardizer";
import {
  elementaFileRefFromPosixPath,
  getFileExtensions,
  getParsedFileExtensions,
} from "@elllphnt/elementa-transformer-primitives";
import { render } from "@testing-library/react";
import { diffLines } from "diff"; // ⬅️ Add this
import fs from "fs/promises";
import path from "path";
import { format, plugins } from "pretty-format";
import { setupEnv } from "./setup.js";

setupEnv();

// Directories
const baseDir = path.resolve("stages");
const inputDir = path.join(baseDir, "input");
const stdDir = path.join(baseDir, "standardized");
const parsedDir = path.join(baseDir, "parsed");
const genDir = path.join(baseDir, "generated");

// Helper to ensure directory exists
async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err: any) {
    if (err.code !== "EEXIST") throw err;
  }
}

// Helper to write file with auto parent dir creation
async function writeFileWithDirs(
  filePath: string,
  content: string,
  encoding: BufferEncoding = "utf8"
) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await fs.writeFile(filePath, content, encoding);
}

// Helper to clean directory (remove and recreate)
async function cleanDir(dirPath: string) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (err: any) {
    // Ignore if directory doesn't exist
    if (err.code !== "ENOENT") throw err;
  }
  await ensureDir(dirPath);
}

async function run() {
  // Clean up parsed and generated directories before running tests
  await cleanDir(parsedDir);
  await cleanDir(genDir);

  const inputFiles = await findTsxFiles(inputDir);

  for (const file of inputFiles) {
    try {
      const inputPath = file;
      const relativePath = path.relative(inputDir, file);

      const ref = elementaFileRefFromPosixPath(relativePath);
      const type = ref.type;
      if (!isValidFileType(type)) {
        console.error(`❌ Invalid file type for ${relativePath}: ${type}`);
        continue; // Skip invalid file types
      }

      const extension = getFileExtensions(type)[0];
      const parseExtension = getParsedFileExtensions(type)[0];

      const stdPath = path.join(stdDir, `${ref.path}${extension}`);
      const parsedPath = path.join(parsedDir, `${ref.path}${parseExtension}`);
      const genPath = path.join(genDir, `${ref.path}${extension}`);

      // 1. Read & standardize
      const inputCode = await fs.readFile(inputPath, "utf8");
      const stdCode = standardizeResource(type, inputCode).trim();
      await writeFileWithDirs(stdPath, serializeData(stdCode));

      // 2. Parse standardized code
      const parsed = parseResource(type, stdCode);
      await writeFileWithDirs(parsedPath, serializeData(parsed));

      // 3. Generate TSX from parsed
      const genCode = compileResource(type, parsed).trim();
      await writeFileWithDirs(genPath, genCode);

      // 4. Dynamically import and render both versions
      const [origMod, genMod] = await Promise.all([
        import(inputPath),
        import(genPath),
      ]);

      const OrigComp = origMod.default;
      const GenComp = genMod.default;

      const domOrig = render(<OrigComp />).container;
      const domGen = render(<GenComp />).container;

      const snapshotOrig = format(domOrig, {
        plugins: [plugins.DOMElement],
      });
      const snapshotGen = format(domGen, {
        plugins: [plugins.DOMElement],
      });

      /* if (stdCode !== genCode) {
        console.error(`❌ Code mismatch in ${ref.path} (${ref.type})`);

        const diffs = diffLines(stdCode, genCode);
        for (const part of diffs) {
          const prefix = part.added ? "+" : part.removed ? "-" : " ";
          const lines = part.value.split("\n").filter(Boolean);
          for (const line of lines) {
            console.log(prefix + line);
          }
        }
      } else */ if (snapshotOrig !== snapshotGen) {
        console.error(`❌ Mismatch in ${ref.path} (${ref.type})`);

        const diffs = diffLines(snapshotOrig, snapshotGen);
        for (const part of diffs) {
          const prefix = part.added ? "+" : part.removed ? "-" : " ";
          const lines = part.value.split("\n").filter(Boolean);
          for (const line of lines) {
            console.log(prefix + line);
          }
        }
      } else {
        console.log(`✅ Match ${ref.path} (${ref.type})`);
      }
    } catch (err) {
      console.error(`❌ Error processing file ${file}:`, err);
      continue; // Skip to the next file on error
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function findTsxFiles(dir: string): Promise<string[]> {
  let files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await findTsxFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

export function serializeData(data: any): string {
  if (typeof data === "string") {
    return data;
  } else {
    return JSON.stringify(data, null, 2);
  }
}
