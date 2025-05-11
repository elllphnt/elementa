import fs from "fs/promises";

// copy the package.json file to the dist folder
const packageJson = JSON.parse(await fs.readFile("./package.json", "utf8"));
packageJson.main = "index.js";
packageJson.types = "index.d.ts";
delete packageJson.scripts;
delete packageJson.devDependencies;
await fs.writeFile("./dist/package.json", JSON.stringify(packageJson, null, 2));
