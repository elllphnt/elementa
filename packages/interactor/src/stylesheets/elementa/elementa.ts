import { Theme } from "../../theme/theme";
import { baseStyleSheet } from "./base";
import { darkModeStyleSheet } from "./dark";
import { handlesStyleSheet } from "./handles/_";
import { interactionsStyleSheet } from "./interactions";
import { layersStyleSheet } from "./layers/_";
import { toolsStyleSheet } from "./tools";

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
