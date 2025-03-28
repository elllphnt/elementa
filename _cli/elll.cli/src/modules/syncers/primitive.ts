// import { makeElllUrl } from "@elllphnt/utils";
// import { fsUtils } from "../../lib/fs.js";
// import { paths } from "../../lib/paths.js";
// import { Syncer } from "../sync/syncer.js";

// export const primitveSyncer: Syncer = {
//   updatePath: async function ({
//     id,
//     path,
//     context,
//   }: {
//     id: string;
//     path: string;
//     context: SyncContext;
//   }): Promise<void> {
//     const config = context.config;
//     const currentFile = context.registry.get(id);
//     if (!currentFile) return;
//     const from = `${currentFile.path}.tsx`;
//     const to = `${path}.tsx`;
//     const fromOutPath = paths.localWorkspaceFile({
//       root: config.root,
//       path: from,
//     });
//     const toOutPath = paths.localWorkspaceFile({ root: config.root, path: to });
//     console.log(`Moving component from ${fromOutPath} to ${toOutPath}`);
//     await fsUtils.move(fromOutPath, toOutPath);
//   },
//   updateContent: async function ({
//     id,
//     path,
//     context,
//   }: {
//     id: string;
//     path: string;
//     context: SyncContext;
//   }): Promise<void> {
//     const url = makeElllUrl(id);
//     const config = context.config;
//     const pathWithExt = `${path}.tsx`;
//     const outPath = paths.localWorkspaceFile({
//       root: config.root,
//       path: pathWithExt,
//     });
//     const content = await context.readContent(url);
//     if (content === undefined) {
//       throw Error(`Failed to read file: ${url}`);
//     }
//     await fsUtils.write(outPath, content);
//   },
// };
