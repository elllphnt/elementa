export function stripUndefined<T>(obj: T) {
  if (typeof obj !== "object") {
    return obj;
  }
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === "object") {
      stripUndefined(obj[key]);
    }
  }
  return obj;
}
