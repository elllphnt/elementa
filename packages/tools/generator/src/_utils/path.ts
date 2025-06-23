import nodepath from "path";

export function joinPaths(...paths: string[]): string {
  return paths
    .flatMap((p) => p.split("/"))
    .filter(Boolean)
    .join("/");
}

export function moduleRelativePath(module1: string, module2: string) {
  const path = nodepath.relative(nodepath.dirname(module1), module2);
  if (!path.startsWith(".")) {
    return "./" + path;
  } else {
    return path;
  }
}
