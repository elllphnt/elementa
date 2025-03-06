export function nameFromPath(path: string): string {
  if (path === "pages/index") {
    return "home";
  }

  const _path = path.split("/");
  const last = _path[_path.length - 1];
  const beforeLast = _path[_path.length - 2];
  if (last === "index" && beforeLast) {
    return beforeLast;
  } else {
    return last;
  }
}

export function resolveArrayIntersection<T>(arrays: T[][]): T[] {
  if (arrays.length === 0) {
    return [];
  }

  return arrays.reduce((acc, val) => {
    return acc.filter((a) => val.includes(a));
  });
}

export function stripEmpty(data: any): any {
  switch (typeof data) {
    case "object":
      if (Array.isArray(data)) {
        return data.map(stripEmpty);
      } else {
        const result: any = {};
        for (const key in data) {
          const value = stripEmpty(data[key]);
          if (value === undefined || value === null) {
            continue;
          } else if (Array.isArray(value) && value.length === 0) {
            continue;
          } else if (
            typeof value === "object" &&
            Object.keys(value).length === 0
          ) {
            continue;
          }
          result[key] = value;
        }
        return result;
      }
    default:
      return data;
  }
}
