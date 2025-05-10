import fs from "fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const log = (...args) => console.log("packup:", ...args);

log("packing up...");

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
delete packageJson.scripts;
delete packageJson.devDependencies;
packageJson.main = "index.js";
packageJson.types = "index.d.ts";

// freeze wildcard dependency versions
for (const [name, version] of Object.entries(packageJson.dependencies ?? {})) {
  if (version === "*") {
    const modulePath = require.resolve(name + "/package.json");
    const modulePackageJson = JSON.parse(fs.readFileSync(modulePath, "utf8"));
    const actualVersion = modulePackageJson.version;
    packageJson.dependencies[name] = actualVersion;

    console.log(`froze ${name} to ${actualVersion}`);
  }
}

fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));
log("updated package.json");

fs.writeFileSync("./dist/.npmignore", [".npmrc"].join("\n"));
log("created .npmignore");

log("packup done.");
