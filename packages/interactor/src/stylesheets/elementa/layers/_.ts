import { Theme } from "~/src/theme/theme";
import { fallbackLayerStyleSheet } from "./fallback";
import { gridLayerStyleSheet } from "./grid";
import { handleLayerStyleSheet } from "./handle";
import { nodeLayerStyleSheet } from "./node";
import { selectionLayerStyleSheet } from "./selection";

export function layersStyleSheet(theme: Theme) {
  return [
    fallbackLayerStyleSheet(theme),
    gridLayerStyleSheet(theme),
    handleLayerStyleSheet(theme),
    selectionLayerStyleSheet(theme),
    nodeLayerStyleSheet(theme),
  ].join("\n\n");
}
