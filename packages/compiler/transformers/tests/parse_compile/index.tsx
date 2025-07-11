import { isValidFileType } from "@elllphnt/elementa-base";
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
import { compileResource, parseResource } from "~/index.js";
import { getDirname } from "../utils/test.js";
import { setupEnv } from "./setup.js";

setupEnv();

const __dirname = getDirname(import.meta.url);

// Directories
const baseDir = path.resolve(__dirname, "stages");
const inputDir = path.join(baseDir, "input");
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
  encoding: BufferEncoding = "utf8",
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

      const parsedPath1 = path.join(
        parsedDir,
        `${ref.path}.1${parseExtension}`,
      );
      const parsedPath2 = path.join(
        parsedDir,
        `${ref.path}.2${parseExtension}`,
      );
      const genPath1 = path.join(genDir, `${ref.path}.1${extension}`);
      const genPath2 = path.join(genDir, `${ref.path}.2${extension}`);

      const inputCode = await fs.readFile(inputPath, "utf8");

      const parsed1 = parseResource(type, inputCode);
      await writeFileWithDirs(parsedPath1, serializeData(parsed1));

      const genCode1 = compileResource(type, parsed1).trim();
      await writeFileWithDirs(genPath1, genCode1);

      const parsed2 = parseResource(type, genCode1);
      await writeFileWithDirs(parsedPath2, serializeData(parsed2));

      const genCode2 = compileResource(type, parsed2).trim();
      await writeFileWithDirs(genPath2, genCode2);

      // 4. Dynamically import and render both versions
      const [origMod, genMod] = await Promise.all([
        import(genPath1),
        import(genPath2),
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

      if (snapshotOrig !== snapshotGen) {
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
