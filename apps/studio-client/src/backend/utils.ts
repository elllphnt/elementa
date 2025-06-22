/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileData, FileTreeData } from "./types";

export function fileListToFileTree(files: FileData[]): FileTreeData[] {
  const tree: { [key: string]: any } = {};

  // Build the tree structure
  files.forEach((file) => {
    const pathParts = file.path.split("/").filter((part) => part !== "");
    let current = tree;

    // Navigate/create the directory structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    // Add the file at the final location
    const fileName = pathParts[pathParts.length - 1];
    current[fileName] = file;
  });

  // Convert tree structure to FileTreeData format
  function convertToFileTree(obj: any): FileTreeData[] {
    const result: FileTreeData[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (
        value &&
        typeof value === "object" &&
        "id" in value &&
        "path" in value &&
        "type" in value
      ) {
        // This is a file
        result.push({
          type: "file",
          name: key,
          data: value as FileData,
        });
      } else {
        // This is a directory
        result.push({
          type: "directory",
          name: key,
          entries: convertToFileTree(value),
        });
      }
    }

    return result;
  }

  return convertToFileTree(tree);
}
