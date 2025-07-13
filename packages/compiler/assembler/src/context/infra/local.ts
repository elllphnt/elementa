import { makeFileUrl, parseAbsoluteFileUrl } from "@elllphnt/elementa-base";
import fs from "fs/promises";
import nodepath from "path";
import type {
  ElementaInfrastructure,
  ElementaReferencedFileData,
} from "./infra.js";

export const getFileTypeFromPath = (filePath: string) => {
  const fileName = nodepath.basename(filePath);
  if (fileName === "router.json") {
    return "router";
  } else if (filePath.endsWith(".component.json")) {
    return "component";
  } else if (filePath.endsWith(".hook.ts")) {
    return "hook";
  } else if (filePath.endsWith(".context.ts")) {
    return "context";
  } else if (filePath.endsWith(".loader.ts")) {
    return "loader";
  } else if (filePath.endsWith(".handler.ts")) {
    return "handler";
  } else if (filePath.endsWith(".script.ts")) {
    return "script";
  } else if (filePath.endsWith(".md")) {
    return "markdown";
  } else if (filePath.endsWith(".json")) {
    return "json";
  } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
    return "script";
  } else {
    return "text";
  }
};
export function makeLocalFsFileUrl({
  path,
  projectName,
}: {
  projectName: string;
  path: string;
}): string {
  return makeFileUrl({
    projectId: encodeURIComponent(projectName),
    fileId: encodeURIComponent(path),
  });
}
export function parseLocalFsFileUrl(url: string): {
  projectName: string;
  path: string;
} {
  const { projectId, fileId } = parseAbsoluteFileUrl(url);
  return {
    projectName: decodeURIComponent(projectId),
    path: decodeURIComponent(fileId),
  };
}

export function createLocalFsInfrastructure(
  root: string
): ElementaInfrastructure {
  return {
    async read(absoluteUrl: string): Promise<string> {
      const { projectName, path } = parseLocalFsFileUrl(absoluteUrl);
      // const projectDir = nodepath.join(root, projectName);
      // const fullPath = nodepath.join(root, projectName, path);
      // const dirPath = nodepath.dirname(fullPath);

      const content = await fs.readFile(
        nodepath.join(root, projectName, path),
        "utf-8"
      );
      // replace file references
      // const actualizedContent = replaceFileReferences(content, (ref) => {
      //   let path: string;
      //   if (ref.startsWith(".")) {
      //     path = nodepath.resolve(dirPath, ref);
      //   } else if (ref.startsWith("~/")) {
      //     path = nodepath.resolve(projectDir, ref.slice(2));
      //   } else {
      //     // package reference
      //     return ref;
      //   }

      //   if (path.endsWith(".js")) {
      //     path = path.slice(0, -3); // Remove .js extension
      //   } else if (path.endsWith(".ts")) {
      //     path = path.slice(0, -3); // Remove .ts extension
      //   } else if (path.endsWith(".tsx")) {
      //     path = path.slice(0, -4); // Remove .tsx extension
      //   } else if (path.endsWith(".jsx")) {
      //     path = path.slice(0, -4); // Remove .jsx extension
      //   }

      //   let filePath: string | undefined;
      //   for (const ext of ["", ".json", ".ts", ".tsx", ".js", ".jsx"]) {
      //     const candidatePath = path + ext;
      //     if (fsSync.existsSync(path + ext)) {
      //       filePath = candidatePath;
      //       break;
      //     }
      //   }

      //   if (!filePath) {
      //     console.error(`File not found for reference: ${ref}`, {
      //       ref,
      //       projectDir,
      //       dirPath,
      //       fullPath,
      //     });
      //     throw new Error(`Failed to resolve reference: ${ref}`);
      //   }

      //   const relativePath = nodepath.relative(projectDir, filePath);
      //   return `file:${encodeURIComponent(projectName)}/${encodeURIComponent(
      //     relativePath
      //   )}`;
      // });
      // return actualizedContent;
      return content;
    },
    async getFile(
      absoluteUrl: string
    ): Promise<ElementaReferencedFileData | undefined> {
      const { path } = parseLocalFsFileUrl(absoluteUrl);
      return {
        url: absoluteUrl,
        path: path,
        type: getFileTypeFromPath(path),
      };
    },
    async getFileAtPath(
      projectId: string,
      path: string
    ): Promise<ElementaReferencedFileData | undefined> {
      const absoluteUrl = makeLocalFsFileUrl({
        projectName: decodeURIComponent(projectId),
        path,
      });
      return {
        url: absoluteUrl,
        path: path,
        type: getFileTypeFromPath(path),
      };
    },
  };
}
