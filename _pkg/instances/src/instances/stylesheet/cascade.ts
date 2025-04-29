import { StyleSheetInstance } from "./stylesheet";

/**
 * Resolves the parent StyleSheetInstance for cascade inheritance.
 */
export interface StyleCascadeResolver {
  getParentStylesheetInstance(): StyleSheetInstance | undefined;
}
