import * as fs from "fs";

export async function addGitignoreEntries({
  path,
  entries,
  comments = [],
}: {
  path: string;
  entries: string[];
  comments?: string[];
}) {
  // Read the file if it exists; initialize as empty otherwise.
  let content = "";
  try {
    content = await fs.promises.readFile(path, "utf8");
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }

  // Build a new block with optional comments and entries.
  let block: string[] = [];
  if (comments.length) {
    block.push(...comments.map((comment) => `# ${comment}`));
  }
  block.push(...entries);

  const result = [content.trimEnd(), "", block.join("\n")].join("\n");

  await fs.promises.writeFile(path, result, "utf8");
}

export function formatGitignoreEntry(
  entry: string,
  type: "file" | "directory" = "file",
) {
  if (type === "directory" && !entry.endsWith("/")) {
    return entry + "/";
  } else {
    return entry;
  }
}
