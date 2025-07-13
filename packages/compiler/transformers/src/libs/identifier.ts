/**
 * Convert an arbitrary string to camelCase.
 * E.g. "hello world" → "helloWorld"
 */
export function camelCase(str: string): string {
  const words = str
    .trim()
    .toLowerCase()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  return words
    .map((word, idx) =>
      idx === 0 ? word : word[0].toUpperCase() + word.slice(1),
    )
    .join("");
}

/**
 * Convert an arbitrary string to PascalCase.
 * E.g. "hello world" → "HelloWorld"
 */
export function pascalCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}
