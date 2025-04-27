import tinycolor from "tinycolor2";
import { Theme } from "~/src/theme/theme";

export const nodeLayerStyleSheet = (theme: Theme) => /* css */ `
    .elementa-layer-node {
    }
    .elementa-controller {
        position:absolute;
        border-radius: 8px;
        min-width: 180px;
        background: #fff;
        color: ${theme.light.text};
    }
    .elementa-draft-controller {
        position:absolute;
        border-radius: 4px;
        background-color: rgb(24 24 25 / 80%);
        color: ${theme.dark.text};
        box-shadow: 0 1px 3px 2px rgba(0,0,0,0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 8px;
        gap: 4px;
    }
    .elementa-draft-controller-option {
        padding: 8px;
        background-color: transparent;
        color: ${theme.dark.text};
        border-radius: 4px;
        cursor: pointer;
        border: none;
    }
    .elementa-draft-controller-option:hover {
        background-color: rgba(255,255,255,0.1);
    }

    .elementa-edge-stroke {
        fill: none;
        stroke: ${tinycolor(theme.light.background).setAlpha(0.2).toRgbString()};
        stroke-width: 2;
    }
    .elementa-edge-fill {
        fill: none;
        stroke: #888;
        stroke-width: 1;
    }
    .elementa-edge-edge {
        fill: #888
    }
    .elementa-edge.hovered .elementa-edge-fill, .elementa-edge.active .elementa-edge-fill, .elementa-edge.selected .elementa-edge-fill {
        stroke: #08f;
        stroke-width: 2
    }
    .elementa-edge.hovered .elementa-edge-stroke, .elementa-edge.active .elementa-edge-stroke, .elementa-edge.selected .elementa-edge-stroke {
        stroke: #08f;
    }
    .elementa-edge.hovered .elementa-edge-edge, .elementa-edge.active .elementa-edge-edge, .elementa-edge.selected .elementa-edge-edge {
        fill: #08f;
    }

    @media (prefers-color-scheme: dark) {
        .elementa-controller {
            background: rgb(24 24 25 / 80%);
            color: ${theme.dark.text};
        }
        .elementa-draft-controller {
            background-color: rgb(24 24 25 / 80%);
            color: ${theme.dark.text};
        }
        .elementa-draft-controller-option {
            color: ${theme.dark.text};
        }
    }
`;
