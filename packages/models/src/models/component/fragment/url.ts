export type FragmentUrlStruct = {
  projectId?: string;
  fileId: string;
  fragmentId: string;
};
export type AbsoluteFragmentUrlStruct = {
  projectId: string;
  fileId: string;
  fragmentId: string;
};

export function makeFragmentUrl({
  projectId,
  fileId,
  fragmentId,
}: FragmentUrlStruct) {
  if (projectId) {
    return `fragment:${projectId}/${fileId}/${fragmentId}`;
  } else {
    return `fragment:${fileId}/${fragmentId}`;
  }
}
export function parseFragmentUrl(url: string): FragmentUrlStruct {
  const parts = url.slice(5).split("/", 3);
  if (!parts.length) {
    return {
      fileId: "",
      fragmentId: "",
    };
  } else if (parts.length === 1) {
    return {
      fileId: "",
      fragmentId: parts[0],
    };
  } else if (parts.length === 2) {
    return {
      fileId: parts[0],
      fragmentId: parts[1],
    };
  } else {
    return {
      projectId: parts[0],
      fileId: parts[1],
      fragmentId: parts[2],
    };
  }
}
export function parseAbsoluteFragmentUrl(
  url: string
): AbsoluteFragmentUrlStruct {
  const parts = url.slice(5).split("/", 3);
  return {
    projectId: parts[0] || "",
    fileId: parts[1] || "",
    fragmentId: parts[2] || "",
  };
}
export function isFragmentUrl(url: string): boolean {
  return url.startsWith("fragment:");
}
export function isRelativeFragmentUrl(url: string): boolean {
  return url.startsWith("fragment:") && !parseFragmentUrl(url).projectId;
}
export function isAbsoluteFragmentUrl(url: string): boolean {
  return url.startsWith("fragment:") && !!parseFragmentUrl(url).projectId;
}

export function toAbsoluteFragmentUrl({
  url,
  projectId,
}: {
  projectId: string;
  url: string;
}): string {
  const { projectId: urlProjectId, fileId, fragmentId } = parseFragmentUrl(url);
  if (urlProjectId) {
    return url;
  } else {
    return makeFragmentUrl({
      projectId,
      fileId,
      fragmentId,
    });
  }
}
export function toRelativeFragmentUrl({ url }: { url: string }): string {
  const { fileId, fragmentId } = parseFragmentUrl(url);
  return makeFragmentUrl({
    fileId,
    fragmentId,
  });
}
