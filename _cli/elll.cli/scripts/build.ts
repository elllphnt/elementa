import * as esbuild from "esbuild";

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
    // minify: true,
    external: ["prettier"],
  });

  return result;
}

build({
  outputPath: "./dist/index.cjs",
});
