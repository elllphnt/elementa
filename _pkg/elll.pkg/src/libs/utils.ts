import _ from "lodash";

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

export function resolveArrayIntersection<T>(
  arrays: T[][],
  equal: (a: T, b: T) => boolean = (a, b) => a === b,
): T[] {
  if (arrays.length === 0) {
    return [];
  }

  return arrays.reduce((acc, val) => {
    return acc.filter((a) => val.some((b) => equal(a, b)));
  });
}

export function resolveCommon<T>(
  values: T[],
  equal: (a: T, b: T) => boolean = _.isEqual,
): T | undefined {
  const firstValue = values[0];
  if (values.every((value) => equal(value, firstValue))) {
    return firstValue;
  }
}
