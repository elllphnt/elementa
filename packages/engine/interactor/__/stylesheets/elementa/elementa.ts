import { Theme } from "../../theme/theme.js";
import { baseStyleSheet } from "./base.js";
import { darkModeStyleSheet } from "./dark.js";
import { handlesStyleSheet } from "./handles/_.js";
import { interactionsStyleSheet } from "./interactions.js";
import { layersStyleSheet } from "./layers/_.js";
import { toolsStyleSheet } from "./tools.js";

export function elementaStyleSheet(theme: Theme) {
  return [
    baseStyleSheet(theme),
    layersStyleSheet(theme),
    handlesStyleSheet(theme),
    toolsStyleSheet(theme),
    interactionsStyleSheet(theme),
    darkModeStyleSheet(theme),
  ].join("\n\n");
}
