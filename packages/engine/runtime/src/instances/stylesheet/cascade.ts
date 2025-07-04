import type { StyleSheetInstance } from "./stylesheet.js";

/**
 * Resolves the parent StyleSheetInstance for cascade inheritance.
 */
export interface StyleCascadeResolver {
  getParentStylesheetInstance(): StyleSheetInstance | undefined;
}
