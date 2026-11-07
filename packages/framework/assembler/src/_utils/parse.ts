import type { z } from "zod";

export function parseContentWithSchema<T>(
  content: string,
  _schema: z.ZodType<T>
): T {
  try {
    const parsed = JSON.parse(content);
    // TODO: re-enable validation: return _schema.parse(parsed);
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse content: ${error}`);
  }
}
