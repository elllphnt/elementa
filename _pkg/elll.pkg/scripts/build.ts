import * as esbuild from "esbuild";
import fs from "fs/promises";

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
    format: "esm",
    minify: true,
    treeShaking: true,
    external: [
      "react",
      "react-dom",
      "react-input-autosize",
      "reactflow",
      "@hello-pangea/dnd",
      "https:*",
      "@babel/standalone",
      "typescript",
    ],
    sourcemap: true,
    metafile: true,
  });

  console.log(await esbuild.analyzeMetafile(result.metafile));

  // Write metafile
  const metafilePath = outPath.replace(/\.js$/, ".meta.json");
  await fs.writeFile(metafilePath, JSON.stringify(result.metafile, null, 2));

  return result;
}

build({
  outputPath: "./build/index.js",
});
