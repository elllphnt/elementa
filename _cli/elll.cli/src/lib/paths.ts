import * as nodepath from "path";

export const remoteRoot = "components";

export const paths = {
  config: ({ directory }: { directory: string }) =>
    nodepath.join(directory, "elll.yml"),

  localWorkspaceFile: ({ root, path }: { path: string; root: string }) =>
    nodepath.join(root, "local", path),
  externalWorkspaceFile: ({
    root,
    workspaceId,
    path,
  }: {
    path: string;
    workspaceId: string;
    root: string;
  }) => nodepath.join(root, "external", workspaceId, path),

  cachedResource: ({ configPath, id }: { configPath: string; id: string }) =>
    nodepath.join(nodepath.dirname(configPath), ".elll", "cache", `${id}`),

  registry: ({ configPath }: { configPath: string }) =>
    nodepath.join(nodepath.dirname(configPath), ".elll/registry.yml"),
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
