import tinycolor from "tinycolor2";
import { Theme } from "~/src/theme/theme";

export const fallbackLayerStyleSheet = (theme: Theme) => /* css */ `
    .elementa-fallback {
        position: absolute;
        inset: 0;
        pointer-events: all
    }
    .elementa-fallback.drop-target, .elementa-fallback.host-drop-target {
        background-color: ${tinycolor(theme.light.selection)
          .setAlpha(0.2)
          .toRgbString()};
    }
`;
