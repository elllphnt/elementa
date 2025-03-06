import fs from "fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const log = (...args: any[]) => console.log("packup:", ...args);

log("packing up...");

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
delete packageJson.scripts;
delete packageJson.devDependencies;
delete packageJson.dependencies;
delete packageJson.type;
delete packageJson.jest;
packageJson.main = "index.js";
packageJson.types = "index.d.ts";
packageJson.bin = {
  [packageJson.name]: "index.js",
};

fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));
log("updated package.json");

if (fs.existsSync("./README.md")) {
  fs.cpSync("./README.md", "./dist/README.md");
  log("copied README.md");
}
if (fs.existsSync("./LICENSE")) {
  fs.cpSync("./LICENSE", "./dist/LICENSE");
  log("copied LICENSE");
}
if (fs.existsSync("./.npmrc")) {
  fs.cpSync("./.npmrc", "./dist/.npmrc");
  log("copied .npmrc");
}

log("packup done.");
