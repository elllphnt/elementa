import type { StyleClassInstance } from "./stylesheet.js";

/**
 * Resolves the parent StyleSheetInstance for cascade inheritance.
 */
export interface StyleCascadeResolver {
  getParentStylesheetInstance(): StyleClassInstance | undefined;
}
