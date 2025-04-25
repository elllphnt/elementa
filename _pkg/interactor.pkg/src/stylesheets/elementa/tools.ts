import { Theme } from "../../theme/theme";

export const toolsStyleSheet = (theme: Theme) => /* css */ `
    .elementa-interface.tool-select {
        cursor: default;
    }
    .elementa-interface.tool-container, .elementa-interface.tool-container-filled, .elementa-interface.tool-frame, .elementa-interface.tool-media, .elementa-interface.tool-vector, .elementa-interface.tool-slot {
        cursor: crosshair;
    }
    .elementa-interface.tool-text {
        cursor: text;
    }
`;
