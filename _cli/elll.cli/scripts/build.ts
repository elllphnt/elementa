import * as esbuild from "esbuild";
import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// get non @elllphnt/* dependencies
const dependencies = Object.keys(packageJson.dependencies).filter(
  (dep) => !dep.startsWith("@elllphnt/"),
);

export async function build({
  outputPath,
}: {
  outputPath?: string;
} = {}) {
  const outPath = outputPath || `./dist/index.js`;
  const result = await esbuild.build({
    entryPoints: ["./src/index.ts"],
    outfile: outPath,
    bundle: true,
    platform: "node",
    format: "cjs",
    treeShaking: true,
    minify: true,
  });

  return result;
}

build({
  outputPath: "./dist/index.js",
});
