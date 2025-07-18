import type { ParseElementContext } from "../element/utils/types.js";

export type ParseComponentContext = {
  getStyleClass: ParseElementContext["getStyleClass"];
};
