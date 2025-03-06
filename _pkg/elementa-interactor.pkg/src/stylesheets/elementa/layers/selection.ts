import { Theme } from "~/src/theme/theme";

export const selectionLayerStyleSheet = (theme: Theme) => /* css */ `
    .elementa-selection {
        container-type: size;
        position: absolute;
        outline-color: ${theme.light.selection};
        outline-style: solid;
        outline-width: 1px;
        outline-offset: -0.5px;
    }

    /* handles */

    .elementa-selection-handles {
        position: absolute;
        inset: 0;
    }

    /* controls */

    .elementa-selection-controls {
        position: absolute;
        bottom: -6px;
        left: 50%;
        line-height: 1;
        font-size: 11px;
        transform: translateX(-50%) translateY(100%);
    }
    .elementa-selection-controls input::placeholder{
        color: inherit;
        opacity: 0.5;
    }
`;
