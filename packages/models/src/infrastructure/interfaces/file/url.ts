import { assert } from "@elllphnt/elementa-utils";

export type FileUrlStruct = {
  projectId?: string;
  fileId: string;
};
export type AbsoluteFileUrlStruct = {
  projectId: string;
  fileId: string;
};

export function makeFileUrl({ projectId, fileId }: FileUrlStruct) {
  if (projectId) {
    return `file:${projectId}/${fileId}`;
  } else {
    return `file:${fileId}`;
  }
}
export function parseFileUrl(url: string): FileUrlStruct {
  const parts = url.slice(5).split("/", 2);
  if (!parts.length) {
    return {
      fileId: "",
    };
  } else if (parts.length === 1) {
    return {
      fileId: parts[0],
    };
  } else {
    return {
      projectId: parts[0],
      fileId: parts[1],
    };
  }
}
export function parseAbsoluteFileUrl(url: string): AbsoluteFileUrlStruct {
  const parts = url.slice(5).split("/", 2);
  return {
    projectId: parts[0] || "",
    fileId: parts[1] || "",
  };
}
export function isFileUrl(url: string): boolean {
  return url.startsWith("file:");
}
export function isRelativeFileUrl(url: string): boolean {
  return url.startsWith("file:") && !url.includes("/");
}
export function isAbsoluteFileUrl(url: string): boolean {
  return url.startsWith("file:") && url.includes("/");
}

export function toAbsoluteFileUrl({
  url,
  projectId,
}: {
  projectId: string;
  url: string;
}): string {
  if (!isRelativeFileUrl(url)) {
    return url;
  }
  const { fileId } = parseFileUrl(url);
  return makeFileUrl({ projectId, fileId });
}
export function toRelativeFileUrl({
  url,
  projectId,
}: {
  url: string;
  projectId?: string;
}): string {
  if (!isAbsoluteFileUrl(url)) {
    return url;
  }
  const { fileId, projectId: urlProjectId } = parseFileUrl(url);
  assert(
    projectId === urlProjectId,
    `Project ID mismatch: expected ${projectId}, got ${urlProjectId}`
  );

  return makeFileUrl({ fileId });
}
