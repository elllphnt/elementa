import tinycolor from "tinycolor2";
import { Theme } from "../../theme/theme.js";

export const baseStyleSheet = (theme: Theme) => /* css */ `
    @layer content, component, editor;
    
    html, body {
        height: 100vh;
        width: 100vw;
        margin: 0;
        padding: 0;
        overflow: hidden;
        user-select: none;
        background-color: ${theme.light.background};
    }

    *::-webkit-scrollbar {
        display: none;
    }      

    .elementa {
        height: 100%;
        width: 100%;

        --elementa-selection-fill: ${tinycolor(theme.light.selection)
          .setAlpha(0.2)
          .toRgbString()};

        --vh-unit: 1vh;
        --vw-unit: 1vw;
    }

    .elementa-viewport {
        position: fixed;
        inset: 0;
        overflow: hidden;
    }

    .elementa-control {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: ${theme.light.text};
    }

    .elementa-content {
        position: absolute;
        top: 50%;
        left: 50%;
        height:0;
        width: 0;
        overflow: visible;
    }
    .elementa-content * {
        pointer-events: none;
        transition: none !important;
    }
    .elementa-content.interactive * {
        pointer-events: auto;
    }

    .elementa-layer{
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
    }

    @media (prefers-color-scheme: dark) {
        html, body {
            background-color: ${theme.dark.background};
        }

        .elementa-control {
            color: ${theme.dark.text};
        }
    }
`;
