import fs from "fs";

const log = (...args) => console.log("packup:", ...args);

log("packing up...");

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
delete packageJson.scripts;
delete packageJson.devDependencies;
packageJson.main = "index.js";
packageJson.types = "index.d.ts";

fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));
log("updated package.json");

fs.cpSync("./.npmrc", "./dist/.npmrc");
log("copied .npmrc");

fs.writeFileSync("./dist/.npmignore", [".npmrc"].join("\n"));
log("created .npmignore");

log("packup done.");
