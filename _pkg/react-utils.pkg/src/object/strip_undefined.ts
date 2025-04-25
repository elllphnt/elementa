export function stripObjectFields(data: any, fields: string[]): any {
  switch (typeof data) {
    case "object":
      if (data === null) {
        return null;
      }
      if (Array.isArray(data)) {
        return data.map((item) => stripObjectFields(item, fields));
      }
      return Object.fromEntries(
        Object.entries(data)
          .filter(([key]) => !fields.includes(key))
          .map(([key, value]) => [key, stripObjectFields(value, fields)])
      );
    default:
      return data;
  }
}

export function stripUndefined<T>(obj: T) {
  if (typeof obj !== "object") {
    return obj;
  }
  for (let key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      stripUndefined(obj[key]);
    }
  }
  return obj;
}
