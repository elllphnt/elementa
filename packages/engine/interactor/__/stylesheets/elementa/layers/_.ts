import type { Theme } from "~/theme/theme";
import { fallbackLayerStyleSheet } from "./fallback.js";
import { gridLayerStyleSheet } from "./grid.js";
import { handleLayerStyleSheet } from "./handle.js";
import { nodeLayerStyleSheet } from "./node.js";
import { selectionLayerStyleSheet } from "./selection.js";

export function layersStyleSheet(theme: Theme) {
  return [
    fallbackLayerStyleSheet(theme),
    gridLayerStyleSheet(theme),
    handleLayerStyleSheet(theme),
    selectionLayerStyleSheet(theme),
    nodeLayerStyleSheet(theme),
  ].join("\n\n");
}
