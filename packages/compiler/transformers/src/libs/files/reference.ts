import { fileExtensionList } from "./extensions.js";

export type ElementaFileRef = {
  type: string;
  path: string;
};

export function elementaFileRefFromPosixPath(file: string): ElementaFileRef {
  for (const [type, extensions] of fileExtensionList) {
    for (const ext of extensions) {
      if (file.endsWith(ext)) {
        const path = file.slice(0, -ext.length);
        return { type: type as ElementaFileRef["type"], path };
      }
    }
  }
  throw new Error(`Unrecognized file type: ${file}`);
}

export function elementaFileRefToPosixPath(ref: ElementaFileRef): string {
  if (ref.type === "directory") return ref.path; // directories don't have extensions

  const entry = fileExtensionList.find(([type]) => type === ref.type);
  if (!entry || entry[1].length === 0) {
    throw new Error(`Unknown or unconfigured type: ${ref.type}`);
  }
  return `${ref.path}${entry[1][0]}`; // use preferred (first) extension
}
