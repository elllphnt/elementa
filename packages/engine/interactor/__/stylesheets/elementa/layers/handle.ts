import tinycolor from "tinycolor2";
import { Theme } from "~/theme/theme";

export const handleLayerStyleSheet = (theme: Theme) => /* css */ `
    .elementa-layer-handle {
    }
    .elementa-interface.flag-handle-hidden .elementa-handle {
        visibility: hidden
    }
    .elementa-interface.flag-handle-hidden .elementa-handle.selected, .elementa-interface.flag-handle-hidden .elementa-handle.elementa-controller {
        visibility: visible
    }
    .elementa-handle {
        position:absolute;
        outline-style: solid;
        outline-width: 0px;
    }
    .interaction-target {
        pointer-events: auto;
    }
    .elementa-handle.drop-target, .elementa-handle.host-drop-target {
        outline-width: 1px;
        outline-offset: -0.5px;
        outline-color: #08f;
        background-color: ${tinycolor(theme.light.selection)
          .setAlpha(0.2)
          .toRgbString()};
    }
    .elementa-handle-label {
        font-size: 11px;
        line-height: 1;
    }
    .elementa-handle-label-placeholder {
        font-style: italic;
        opacity: 0.5;
    }
    .elementa-handle.hovered{
        outline-color: ${theme.light.selection};
        outline-width: 2px;
        outline-offset: -1px;
    }
    .elementa-handle.selected{
        outline-color: ${theme.light.selection};
        outline-width: 1px;
        outline-offset: -0.5px;
    }
    
    .elementa-interface.flag-wireframe .elementa-handle {
        outline-color: #5554;
        outline-width: 1px;
        outline-offset: -0.5px;
    }
    .elementa-interface.flag-wireframe .elementa-handle.hovered{
        outline-color: ${theme.light.selection};
        outline-width: 2px;
        outline-offset: -1px;
    }
    .elementa-interface.flag-wireframe .elementa-handle.selected{
        outline-color: ${theme.light.selection};
        outline-width: 1px;
        outline-offset: -0.5px;
    }

    .elementa-handle-frame {
        outline: 1px solid #5554;
        container-type: size;
    }
    .elementa-handle-slot {
        outline: 1px dashed #5554;
    }

    .elementa-handle-port{
        --base-scale: 1;
        --outline-scale: 1;
        position: absolute;
        pointer-events: auto;
        border-radius: 50%;
        background-color: #fff;
        outline-offset: 0px !important;
        transform: scale(var(--base-scale));
        outline-width: calc(1px * var(--outline-scale));
    }
    .elementa-handle-port:hover {
        transform: scale(calc(var(--base-scale) * 1.2));
        outline-color: ${theme.light.selection};
        outline-width: calc(2px * var(--outline-scale));
    }

    .elementa-handle-controller{
        border-radius: calc(8px * var(--scale));
        pointer-events: auto;
        outline-color: #5554;
        outline-width: 1px;
        outline-offset: -0.5px;
    }
    .elementa-handle-controller.hovered{
        outline-color: ${theme.light.selection};
        outline-width: 2px;
        outline-offset: -1px;
    }

    .element-port{
        position: absolute;
        pointer-events: auto;
        border-radius: 50%;
        background-color: #fff;
        outline: solid 1px;
        outline-color: ${theme.light.selection};
        outline-offset: 0px !important;

        &:hover {
            transform: scale(1.2);
        }

        @container (max-width: 16px) or (max-height: 16px){
            display: none;
        }
    }

    .elementa-style-modifiers-indicator {
        font-size: 10px;
        background-color: #8888;
        color: #fff;
        padding: 1px 3px;
        border-radius: 2px;

        &.active {
            background-color: #08f;
        }

        @container (max-width: 100px){
            display: none;
        }
    }
`;
