import nodePath from "path";
import { File } from "./file.js";
import { GenerationContext, GenerationResult, Generator } from "./generator.js";

function getGenerator(
  type: string,
  context: GenerationContext,
): Generator | undefined {
  return context.generators[type];
}

export type SyncResult = {
  updated: boolean;
};

export async function updateResource(
  file: File,
  result: GenerationResult,
  context: GenerationContext,
): Promise<void> {
  const cached = await context.cache.getResource(file.id);
  const toRemove = new Set(cached?.files || []);
  // write new files
  for (const file of result.files || []) {
    const outPath = nodePath.join(context.paths.outDir, file.path);
    await context.fs.write(outPath, file.content);
    toRemove.delete(file.path);
  }
  // update cache
  await context.cache.saveResource({
    ...file,
    files: [...(result.files || []).map((f) => f.path)],
  });

  // remove no longer needed files
  for (const file of toRemove) {
    const outPath = nodePath.join(context.paths.outDir, file);
    await context.fs.remove(outPath);
  }
}

export async function syncResource({
  file,
  context,
  force,
}: {
  file: File;
  context: GenerationContext;
  force?: boolean;
}): Promise<SyncResult> {
  const generate = getGenerator(file.type, context);
  if (!generate) {
    throw new Error(`No generator found for ${file.type}`);
  }

  if (!force) {
    const cached = await context.cache.getResource(file.id);
    if (cached && cached.hash === file.hash && cached.path === file.path) {
      return {
        updated: false,
      };
    }
  }

  const result = await generate(file, context);
  await updateResource(file, result, context);

  return {
    updated: true,
  };
}
