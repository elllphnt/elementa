#!/usr/bin/env -S npx tsx

import { getPackages } from "@manypkg/get-packages";
import fs from "fs";
import path from "path";

const log = (...args: unknown[]) => console.log("packup:", ...args);

// ✅ Allowed output file extensions
const ALLOWED_EXTENSIONS = [".js", ".ts"];

const BUILD_DIR = "./build";
const DIST_DIR = "./dist";

log("packing up...");

// --- Get workspace packages ---
const { packages } = await getPackages(process.cwd());
const packageVersionMap = new Map<string, string>();

for (const pkg of packages) {
  packageVersionMap.set(pkg.packageJson.name, pkg.packageJson.version);
}

// --- Copy files from build to dist ---
function copyDirWithFilter(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

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
packageJson.main = "index.js";
packageJson.types = "index.d.ts";

// --- Freeze wildcard and workspace versions ---
function freezeVersions(deps?: Record<string, string>) {
  if (!deps) return;

  for (const [name, version] of Object.entries(deps)) {
    if (version === "*" || version.startsWith("workspace:")) {
      const actualVersion = packageVersionMap.get(name);
      if (actualVersion) {
        deps[name] = actualVersion;
        log(`froze ${name} to ${actualVersion}`);
      } else {
        throw new Error(
          `Could not find version for package: ${name}. Please ensure it is defined in package.json.`
        );
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
