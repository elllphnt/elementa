export function generateClassNames(
  classNames: (string | [string, string])[],
): string {
  const staticClasses: string[] = [];
  const dynamicClasses: [string, string][] = [];

  for (const className of classNames) {
    if (typeof className === "string") {
      staticClasses.push(className);
    } else if (Array.isArray(className)) {
      dynamicClasses.push(className);
    }
  }

  const staticClassesCode = staticClasses.join(" ");
  const dynamicClassesCode = dynamicClasses
    .map(([key, value]) => `"${key}": ${value},`)
    .join(" ");

  if (staticClassesCode && dynamicClassesCode) {
    return `["${staticClassesCode}", {${dynamicClassesCode}}]`;
  } else if (staticClassesCode) {
    return `"${staticClassesCode}"`;
  } else if (dynamicClassesCode) {
    return `{${dynamicClassesCode}}`;
  } else {
    return '""';
  }
}
