import type { Theme } from "~/theme/theme";

export const paddingHandleStyleSheet = (theme: Theme) => /* css */ `
    .elementa-padding-marker{
        display: none;
        position: absolute;
        outline: 1px dashed #08f;
        outline-offset: -0.5px;
    }
    .elementa-handle.selected .elementa-padding-marker{
        display: block;
    }

    .elementa-padding-handle {
        position: absolute;
        pointer-events: auto;
        width: 0; 
        height: 0;
        z-index: 2;
        overflow: visible;
        transform: var(--transform);
    }
    @container (max-width: 70px) or (max-height: 70px){
        .elementa-padding-handle {
            display: none;
        }
    }
    .elementa-padding-handle::before {
        content: "";
        pointer-events: auto;
        display: block;
        width: 4px;
        height: 14px;
        border-radius: 4px;
        background-color: #fff;
        outline: 1px solid #08f;
        transform: translate(-50%, -50%);
    }
    .elementa-padding-handle-top {
        top: 6;
        left: 50%;
        --transform: rotate(90deg);
        cursor: ns-resize;
    }
    .elementa-padding-handle-bottom {
        bottom: 6;
        left: 50%;
        --transform: rotate(90deg);
        cursor: ns-resize;
    }
    .elementa-padding-handle-left {
        left: 6;
        top: 50%;
        --transform: rotate(0deg);
        cursor: ew-resize;
    }
    .elementa-padding-handle-right {
        right: 6;
        top: 50%;
        --transform: rotate(0deg);
        cursor: ew-resize;
    }
    .elementa-padding-handle:hover, .elementa-padding-handle.active {
        transform: var(--transform) scale(1.2);
    }

    /* edge inset marker */
    .elementa-edge-inset-marker {
        position: absolute;
        pointer-events: none;
        outline-width: 1px;
        outline-offset: -0.5px;
        outline-color: #08f;
        pointer-events: none;
    }
    .elementa-edge-inset-marker.elementa-edge-inset-marker-padding {
        outline-style: dashed;
    }
    .elementa-edge-inset-marker.elementa-edge-inset-marker-margin {
        outline-style: dotted;
    }
`;
