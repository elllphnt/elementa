import * as nodepath from "path";

export const remoteRoot = "components";

export const paths = {
  // config
  config: ({ directory }: { directory: string }) =>
    nodepath.join(directory, "elll.config.ts"),

  // repository
  gitignore: ({ configPath }: { configPath: string }) =>
    nodepath.join(nodepath.dirname(configPath), ".gitignore"),

  // elll
  elll: ({ configPath }: { configPath: string }) =>
    nodepath.join(nodepath.dirname(configPath), ".elll"),
  cache: ({ configPath }: { configPath: string }) =>
    nodepath.join(nodepath.dirname(configPath), ".elll", "cache.yml"),
  cachedFile: ({ configPath, id }: { configPath: string; id: string }) =>
    nodepath.join(nodepath.dirname(configPath), ".elll", "files", `${id}`),
};

export function convertPath({
  from,
  toRoot,
  fromRoot,
}: {
  from: string;
  fromRoot: string;
  toRoot: string;
}) {
  return nodepath.join(toRoot, nodepath.relative(fromRoot, from));
}
export function getRelativePath({
  path,
  root,
}: {
  path: string;
  root: string;
}) {
  return nodepath.relative(root, path);
}
