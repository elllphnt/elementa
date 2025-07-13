import { replaceReferences } from "@elllphnt/elementa-transformers";
import { createClientCredentialsTokenManager } from "@elllphnt/elll-client";
import { Fabric } from "@elllphnt/elll-fabric";
import { parseFileId } from "@elllphnt/primitives";
import fsSync from "fs";
import fs from "fs/promises";
import nodepath from "path";
import { env } from "./env.js";

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

const tokenManager = createClientCredentialsTokenManager({
  issuerUrl: env.AUTH_ISSUER_URL,
  clientId: env.AUTH_CLIENT_ID,
  clientSecret: env.AUTH_CLIENT_SECRET,
  audience: env.ELLL_API_AUDIENCE,
});

const fabric = new Fabric({
  apiUrl: env.ELLL_API_URL,
  tokenManager,
});

async function installProject({
  projectPath,
  workspaceId,
  installPath = "",
}: {
  projectPath: string;
  workspaceId: string;
  installPath?: string;
}) {
  const pathMap: Record<string, { id: string; type: string; path: string }> =
    {};
  async function getFileAtPath(filePath: string) {
    const actualPath = nodepath.join(installPath, filePath);
    let file = pathMap[actualPath];
    if (file) {
      return file;
    } else {
      const fileType = getFileTypeFromPath(actualPath);
      file = await fabric.kernel.getOrCreateFileAtPath({
        workspaceId,
        path: actualPath,
        type: fileType,
      });
      pathMap[file.path] = file;
      return file;
    }
  }

  // traverse the project and upload each file one by one
  await traverseDirectoryDeep(projectPath, async (fullpath) => {
    const relativePath = nodepath.relative(projectPath, fullpath);
    const dirPath = nodepath.dirname(fullpath);
    console.log(`Processing file: ${relativePath}`);

    const file = await getFileAtPath(relativePath);
    const content = await fs.readFile(fullpath, "utf-8");

    const updatedContent = await replaceReferences(content, async (ref) => {
      console.log(`Resolving reference: ${ref} in ${fullpath}`);
      let refPath: string;
      if (ref.startsWith(".")) {
        refPath = nodepath.resolve(dirPath, ref);
      } else if (ref.startsWith("~/")) {
        refPath = nodepath.resolve(projectPath, ref.slice(2));
      } else {
        // package reference
        return ref;
      }

      if (refPath.endsWith(".js")) {
        refPath = refPath.slice(0, -3); // Remove .js extension
      } else if (refPath.endsWith(".ts")) {
        refPath = refPath.slice(0, -3); // Remove .ts extension
      } else if (refPath.endsWith(".tsx")) {
        refPath = refPath.slice(0, -4); // Remove .tsx extension
      } else if (refPath.endsWith(".jsx")) {
        refPath = refPath.slice(0, -4); // Remove .jsx extension
      }

      let filePath: string | undefined;
      for (const ext of ["", ".json", ".ts", ".tsx", ".js", ".jsx"]) {
        const candidatePath = refPath + ext;
        if (fsSync.existsSync(refPath + ext)) {
          filePath = candidatePath;
          break;
        }
      }

      if (!filePath) {
        throw new Error(`Failed to resolve reference: ${ref}`);
      }

      const relativePath = nodepath.relative(projectPath, filePath);
      const file = await getFileAtPath(relativePath);
      console.log(`Resolved reference ${ref} to file ID: ${file.id}`);
      const { fileBareId } = parseFileId(file.id);
      return `file:${fileBareId}`;
    });

    await fabric.kernel.updateFileContent({
      fileId: file.id,
      content: updatedContent,
    });
    console.log(
      `Updated content for file ID: ${file.id}.`,
      updatedContent.length
    );
  });
}

async function traverseDirectoryDeep(
  dirPath: string,
  callback: (path: string) => Promise<void>,
  options: {
    includeDirectories?: boolean;
  } = {}
) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = nodepath.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (options.includeDirectories) {
          await callback(fullPath);
        }
        // Recursively traverse subdirectory
        await traverseDirectoryDeep(fullPath, callback, options);
      } else if (entry.isFile()) {
        await callback(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error traversing directory ${dirPath}:`, error);
    throw error;
  }
}

installProject({
  projectPath:
    "/home/krvnsvlcy/repos/elllphnt/elementa/playground/infra/design-agency",
  workspaceId: "wks_g0wr7xz74kkgdg53i611899v",
});
