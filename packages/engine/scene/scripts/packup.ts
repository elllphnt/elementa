import fs from "fs";
import { createRequire } from "node:module";
import path from "path";

const require = createRequire(import.meta.url);
const log = (...args: unknown[]) => console.log("packup:", ...args);

// ✅ Allowed output file extensions
const ALLOWED_EXTENSIONS = [".ts"];

const BUILD_DIR = "./build";
const DIST_DIR = "./dist";

log("packing up...");

// --- Copy files from build to dist ---
function copyDirWithFilter(src: string, dest: string) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      copyDirWithFilter(srcPath, destPath);
    } else if (ALLOWED_EXTENSIONS.includes(path.extname(entry))) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirWithFilter(path.resolve(BUILD_DIR), path.resolve(DIST_DIR));
log(`copied build → dist (${ALLOWED_EXTENSIONS.join(", ")} only)`);

// --- Load and clean package.json ---
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
delete packageJson.scripts;
delete packageJson.devDependencies;
packageJson.types = "index.d.ts";
delete packageJson.main;

// --- Freeze wildcard and workspace versions ---
function freezeVersions(deps?: Record<string, string>) {
  if (!deps) return;

  for (const [name, version] of Object.entries(deps)) {
    if (version === "*" || version.startsWith("workspace:")) {
      try {
        const resolvedPath = require.resolve(`${name}/package.json`);
        const actualVersion = JSON.parse(
          fs.readFileSync(resolvedPath, "utf8")
        ).version;
        deps[name] = actualVersion;
        console.log(`froze ${name} to ${actualVersion}`);
      } catch {
        console.warn(`⚠️ could not resolve version for ${name}`);
      }
    }
  }
}

freezeVersions(packageJson.dependencies);
freezeVersions(packageJson.peerDependencies);
freezeVersions(packageJson.optionalDependencies);

// --- Write updated package.json ---
fs.writeFileSync(
  path.resolve(DIST_DIR, "package.json"),
  JSON.stringify(packageJson, null, 2)
);

log("updated package.json");
log("packup done.");
