import { Theme } from "~/src/theme/theme";

export const gapHandleStyleSheet = (theme: Theme) => /* css */ `
    .elementa-gap-handle {
        position: absolute;
        pointer-events: auto;
    }
    .elementa-gap-handle:hover {
        background: #f082
    }
    .elementa-gap-handle-handle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) var(--elementa-gap-handle-handle-rotate);
        height: 4px;
        width: 14px;
        background-color: #fff;
        outline: 1px solid #f08;
        border-radius: 2px;
        cursor: var(--elementa-gap-handle-handle-cursor);
    }
    .elementa-gap-handle {
        --elementa-gap-handle-handle-rotate: rotate(0);
        cursor: ns-resize;
        }
    .elementa-gap-handle[data-gap-direction="vertical"] {
        --elementa-gap-handle-handle-rotate: rotate(90deg);
        cursor: ew-resize;
    }
    .elementa-interface.flag-gapping .elementa-gap-handle-handle {
        display: none;
    }
    .elementa-interface.flag-gapping-x .elementa-gap-handle[data-gap-direction="vertical"],
    .elementa-interface.flag-gapping-y .elementa-gap-handle[data-gap-direction="horizontal"] {
        background: #f082;
    }
    .elementa-interface.flag-gapping-x .elementa-gap-handle[data-gap-direction="horizontal"],
    .elementa-interface.flag-gapping-y .elementa-gap-handle[data-gap-direction="vertical"] {
        display: none;
    }
    .elementa-gap-handle:hover > .elementa-gap-handle-handle {
        transform: translate(-50%, -50%) scale(1.2) var(--elementa-gap-handle-handle-rotate);
    }
    @container (max-width: 70px) or (max-height: 70px){
        .elementa-gap-handle {
            display: none;
        }
    }
`;
