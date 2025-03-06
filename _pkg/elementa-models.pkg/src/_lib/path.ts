export function normalizeObjectAccessorPath(path: string | string[]): string[] {
  if (Array.isArray(path)) {
    return path;
  }

  const regex = /\[([^\]]+)\]|\.?([^.\[\]]+)/g; // Note the 'g' flag for global match
  const result: string[] = [];

  for (const match of path.matchAll(regex)) {
    const key = match[1] || match[2];
    if (key) {
      result.push(key.replace(/^['"]|['"]$/g, "")); // Remove surrounding quotes if any
    }
  }

  return result;
}

export function matchObjectAccessorPaths(
  path1: string | string[],
  path2: string | string[],
): boolean {
  const parts1 = normalizeObjectAccessorPath(path1);
  const parts2 = normalizeObjectAccessorPath(path2);

  if (parts1.length !== parts2.length) {
    return false;
  }

  for (let i = 0; i < parts1.length; i++) {
    if (parts1[i] !== parts2[i]) {
      return false;
    }
  }

  return true;
}
