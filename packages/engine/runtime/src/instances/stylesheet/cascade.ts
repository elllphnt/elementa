import type { StyleClassInstance } from "./stylesheet.js";

/**
 * Resolves the parent StyleClassInstance for cascade inheritance.
 */
export interface StyleCascadeResolver {
  getParentStylesheetInstance(): StyleClassInstance | undefined;
}
