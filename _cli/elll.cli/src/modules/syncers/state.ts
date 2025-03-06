import { elllFileTypes, makeElllUrl } from "@elllphnt/utils";
import { fsUtils } from "../../lib/fs.js";
import { paths } from "../../lib/paths.js";
import { SyncContext } from "../sync/context.js";
import { registerSyncer, Syncer } from "../sync/syncer.js";

export const stateSyncer: Syncer = {
  updatePath: async function ({
    id,
    path,
    context,
  }: {
    id: string;
    path: string;
    context: SyncContext;
  }): Promise<void> {
    const config = context.config;
    const currentFile = context.registry.get(id);
    if (!currentFile) return;
    const from = currentFile.path;
    const to = path;
    const fromOutPath = paths.localWorkspaceFile({
      root: config.root,
      path: from,
    });
    const toOutPath = paths.localWorkspaceFile({ root: config.root, path: to });
    console.log(`Moving component from ${fromOutPath} to ${toOutPath}`);
    await fsUtils.move(fromOutPath, toOutPath);
  },
  updateContent: async function ({
    id,
    path,
    context,
  }: {
    id: string;
    path: string;
    context: SyncContext;
  }): Promise<void> {
    const url = makeElllUrl(id);
    const config = context.config;
    const pathWithExt = `${path}.tsx`;
    const outPath = paths.localWorkspaceFile({
      root: config.root,
      path: pathWithExt,
    });
    const content = await context.readContent(url);
    if (content === undefined) {
      throw Error(`Failed to read file: ${url}`);
    }
    await fsUtils.write(outPath, content);
  },
};

registerSyncer(elllFileTypes.state, stateSyncer);
