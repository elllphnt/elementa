import fs from "fs";

const log = (...args) => console.log("packup:", ...args);

log("packing up...");

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
delete packageJson.scripts;
delete packageJson.devDependencies;

fs.writeFileSync("./dist/package.json", JSON.stringify(packageJson, null, 2));
log("updated package.json");

log("packup done.");
