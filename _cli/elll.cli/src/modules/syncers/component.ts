// import {
//   ImportMap,
//   Namespace,
//   transpileComponent,
// } from "@elllphnt/elll-react-transpiler";
// import { makeElllUrl } from "@elllphnt/utils";
// import nodePath from "path";
// import { fsUtils } from "../../lib/fs.js";
// import { paths } from "../../lib/paths.js";
// import { downloadDriveFile, getDriveFile } from "../api/drive.js";
// import { formatTypescript } from "../format/typescript.js";
// import { Syncer } from "../sync/syncer.js";
// import { makeAbsoluteFileUrl } from "../urls/urls.js";

// export const componentSyncer: Syncer = {
//   async updatePath({ id, path, context }) {
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
//   async updateContent({ id, context }) {
//     const url = makeElllUrl(id);
//     const outPath = await context.getOutputPath(url, ".tsx");
//     const dirPath = nodePath.dirname(outPath);
//     const content = await context.readContent(url);
//     if (content === undefined) {
//       console.error(`Failed to read content: ${url}`);
//       return;
//     }
//     let json = {};
//     try {
//       json = JSON.parse(content.trim() || "{}");
//     } catch {
//       console.error(`Failed to parse JSON: ${url}`);
//       return;
//     }
//     const namespace = new Namespace();
//     const importMap = new ImportMap({ namespace });

//     const { generate, dependencies, references } = transpileComponent(json);
//     for (const dep of dependencies) {
//       let depUrl: string;

//       if (dep.url.startsWith("local:")) {
//         const absoluteUrl = makeAbsoluteFileUrl(url, dep.url);
//         const depOutPath = await context.getOutputPath(absoluteUrl, null);
//         depUrl = nodePath.relative(dirPath, depOutPath);
//         if (!depUrl.startsWith(".")) {
//           depUrl = "./" + depUrl;
//         }
//       } else {
//         depUrl = dep.url;
//       }

//       importMap.import({
//         ...dep,
//         url: depUrl,
//       });
//     }
//     const refValues: Map<number, any> = new Map();

//     for (const ref of references) {
//       let refUrl: string;

//       switch (ref.data.type) {
//         case "drive-file": {
//           const id: string = (ref.data as any).id;
//           const file = await getDriveFile(id);
//           if (!file) {
//             console.error(`Failed to get file: ${id}`);
//             continue;
//           }
//           const outPath = nodePath.join(context.config.storage.root, file.path);
//           const baseUrl = context.config.storage.baseUrl || "/";
//           const url = nodePath.join(baseUrl, file.path);
//           await downloadDriveFile(id, outPath);
//           refValues.set(ref.key, url);
//           break;
//         }
//         default: {
//           refValues.set(ref.key, null);
//         }
//       }
//     }

//     const componentCode = generate({
//       getName: (key) => {
//         const name = namespace.getName(key);
//         if (!name) {
//           throw new Error(`Name for key not found: ${key}`);
//         }
//         return name;
//       },
//       getResolvedValue: (key) => {
//         return refValues.get(key);
//       },
//     });
//     const importCode = importMap.toCode();

//     const code = [
//       importCode,
//       ``,
//       `const Component = ${componentCode}`,
//       ``,
//       `export default Component;`,
//     ].join("\n");

//     const formatted = await formatTypescript(code);

//     await fsUtils.write(outPath, formatted);
//   },
// };
