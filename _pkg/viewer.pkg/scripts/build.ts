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
    external: [
      "rxjs",
      "react",
      "react-dom",
      "react-input-autosize",
      "typescript",
      "@babel/standalone",
      "@babel/types",
      "https:*",
    ],
    sourcemap: true,
    metafile: true,
  });

  // Write metafile
  const metafilePath = outPath.replace(/\.js$/, ".meta.json");
  await fs.writeFile(metafilePath, JSON.stringify(result.metafile, null, 2));

  return result;
}

if (require.main === module) {
  build({
    outputPath: "./build/index.js",
  });
}
