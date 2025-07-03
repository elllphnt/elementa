import { Theme } from "~/theme/theme";

export const gridLayerStyleSheet = (theme: Theme) => /* css */ `
    .elementa-grid {
        position: absolute;
        inset: 0px;
    }
    .elementa-grid-hline {
        position: absolute;
        left: 0px;
        right: 0px;
        top: -1px;
        height: 1px;
        display: none;
        background-color: ${theme.light.grid};
        transform: translateY(-50%);
    }
    .elementa-grid-vline {
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: -1px;
        width: 1px;
        display: none;
        background-color: ${theme.light.grid};
        transform: translateX(-50%);
    }
`;
