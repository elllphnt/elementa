import { build } from "esbuild";
import { rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export async function loadTsModule(path: string) {
  const outfile = join(tmpdir(), path.replace(/\//g, "_") + ".js");

  await build({
    entryPoints: [path],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    sourcemap: false,
    write: true,
  });

  const module = await import(`file://${outfile}`);
  rmSync(outfile, { force: true });

  return module;
}
