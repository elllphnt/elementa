import { Theme } from "~/theme/theme";
import { connectionHandleStyleSheet } from "./connection.js";
import { cornerHandleStyleSheet } from "./corner.js";
import { gapHandleStyleSheet } from "./gap.js";
import { paddingHandleStyleSheet } from "./padding.js";
import { resizeHandleStyleSheet } from "./resize.js";
import { sizeHandleStyleSheet } from "./size.js";

export function handlesStyleSheet(theme: Theme) {
  return [
    cornerHandleStyleSheet(theme),
    gapHandleStyleSheet(theme),
    paddingHandleStyleSheet(theme),
    resizeHandleStyleSheet(theme),
    sizeHandleStyleSheet(theme),
    connectionHandleStyleSheet(theme),
  ].join("\n\n");
}
