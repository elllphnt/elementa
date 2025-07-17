import prettier from "prettier";

/**
 * Format code using prettier with TypeScript parser
 */
export async function formatCode(code: string): Promise<string> {
  return await prettier.format(code, {
    parser: "typescript",
  });
}

/**
 * Remove empty lines and trim whitespace for comparison
 */
export function stripEmptylines(code: string): string {
  return code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}
