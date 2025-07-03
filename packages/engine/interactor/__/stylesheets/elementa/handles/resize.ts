import { Theme } from "~/theme/theme";

export const resizeHandleStyleSheet = (theme: Theme) => /* css */ `
    .elementa-resize-handle-corner {
        position: absolute;
        width: 9px;
        height: 9px;
        pointer-events: auto;
        z-index: 1;
    }
    .elementa-resize-handle-corner::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 5px;
        height: 5px;
        outline: 1px solid #08f;
        background-color: #fff;
    }
    .elementa-resize-handle-edge {
        position: absolute;
        pointer-events: auto;
        z-index: 1;
    }
    .elementa-resize-handle-top {
        top: -2px;
        left: 5px;
        right: 5px;
        height: 5px;
        cursor: ns-resize;
    }
    .elementa-resize-handle-bottom {
        bottom: -2px;
        left: 5px;
        right: 5px;
        height: 5px;
        cursor: ns-resize;
    }
    .elementa-resize-handle-left {
        top: 5px;
        left: -2px;
        bottom: 5px;
        width: 5px;
        cursor: ew-resize;
    }
    .elementa-resize-handle-right {
        top: 5px;
        right: -2px;
        bottom: 5px;
        width: 5px;
        cursor: ew-resize;
    }
    .elementa-resize-handle-top-left {
        top: -4px;
        left: -4px;
        cursor: nwse-resize;
    }
    .elementa-resize-handle-top-right {
        top: -4px;
        right: -4px;
        cursor: nesw-resize;
    }
    .elementa-resize-handle-bottom-left {
        bottom: -4px;
        left: -4px;
        cursor: nesw-resize;
    }
    .elementa-resize-handle-bottom-right {
        bottom: -4px;
        right: -4px;
        cursor: nwse-resize;
    }
`;
