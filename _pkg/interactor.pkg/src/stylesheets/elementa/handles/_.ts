import { Theme } from "~/src/theme/theme";
import { connectionHandleStyleSheet } from "./connection";
import { cornerHandleStyleSheet } from "./corner";
import { gapHandleStyleSheet } from "./gap";
import { paddingHandleStyleSheet } from "./padding";
import { resizeHandleStyleSheet } from "./resize";
import { sizeHandleStyleSheet } from "./size";

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
