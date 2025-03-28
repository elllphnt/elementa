import fs from "fs";
import { argv } from "node:process";
import { externals } from "./constant";

const isPrivate = !argv.includes("--public");

const log = (...args: any[]) => console.log("packup:", ...args);

log("packing up...");

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
if (isPrivate) {
  packageJson.name = "@elllphnt/" + packageJson.name;
}
delete packageJson.scripts;
delete packageJson.devDependencies;
delete packageJson.type;
delete packageJson.jest;
packageJson.main = "index.js";
packageJson.types = "index.d.ts";
packageJson.bin = {
  [packageJson.name]: "index.cjs",
};
packageJson.dependencies = Object.fromEntries(
  externals.map((name) => [name, packageJson.dependencies[name]]),
);

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

log("packup done.");
