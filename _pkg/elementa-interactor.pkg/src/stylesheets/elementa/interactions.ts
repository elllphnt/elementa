import { Theme } from "../../theme/theme";

export const interactionsStyleSheet = (theme: Theme) => /* css */ `
    /* focus */

    .elementa-interface.focused .elementa-layer-handle {
        display: none;
    }
    .elementa-interface.focused .elementa-layer-selection {
        display: none;
    }

    /***************** TOOL INTERACTIONS *****************/
    
    /* moving */
    
    .elementa-interface.flag-moving .elementa-layer-selection {
        display: none;
    }
    .elementa-interface.flag-moving .elementa-handle {
        pointer-events: none;
    }
    .elementa-interface.flag-moving .interaction-target {
        pointer-events: none;
    }
    .elementa-interface.flag-moving .elementa-controller {
        pointer-events: none;
    }
    
    /* dragging */
    
    .elementa-interface.flag-dragging .elementa-layer-selection {
        display: none;
    }
    .elementa-interface.flag-dragging .elementa-handle {
        outline-width: 0;
    }
    .elementa-interface.flag-dragging .elementa-handle-frame {
        outline-width: 1px;
    }
    .elementa-interface.flag-dragging .elementa-padding-marker {
        display: none;
    }
    
    /* drawing */

    .elementa-interface.flag-drawing .elementa-handle {
        display: none;
    }
    .elementa-interface.flag-drawing .elementa-layer-selection {
        display: none;
    }

    /* selecting */

    .elementa-interface.flag-selecting .interaction-target{
        pointer-events: none;
    }
    .elementa-interface.flag-selecting .elementa-fallback {
        pointer-events: none
    }
    .elementa-interface.flag-selecting .elementa-resize-handle-corner {
        pointer-events: none;
    }
    .elementa-interface.flag-selecting .elementa-resize-handle-edge {
        pointer-events: none;
    }
    

    /***************** HANDLE INTERACTIONS *****************/

    /* resize */
    
    .elementa-interface.flag-resizing .interaction-target {
        pointer-events: none;
    }
    .elementa-interface.flag-resizing .elementa-gap-handle {
        display: none;
    }
    .elementa-interface.flag-resizing .elementa-corner-handle {
        display: none;
    }
    .elementa-interface.flag-resizing .elementa-padding-handle {
        display: none;
    }


    /* corning */

    .elementa-interface.flag-corning .elementa-layer-handle {
        display: none;
    }
    .elementa-interface.flag-corning .elementa-selection {
        outline: none;
    }
    .elementa-interface.flag-corning .elementa-selection-controls {
        display: none;
    }
    .elementa-interface.flag-corning .elementa-gap-handle {
        display: none;
    }
    .elementa-interface.flag-corning .elementa-resize-handle {
        display: none;
    }
    .elementa-interface.flag-corning .elementa-padding-handle {
        display: none;
    }

    /* padding */

    .elementa-interface.flag-padding .elementa-handle {
        pointer-event: none;
        outline: none;
    }
    .elementa-interface.flag-padding .elementa-selection {
    }
    .elementa-interface.flag-padding .elementa-selection-controls {
        display: none;
    }
    .elementa-interface.flag-padding .elementa-gap-handle {
        display: none;
    }
    .elementa-interface.flag-padding .elementa-resize-handle {
        display: none;
    }
    .elementa-interface.flag-padding .elementa-corner-handle {
        display: none;
    }

    /* gapping */

    .elementa-interface.flag-gapping .elementa-handle {
        pointer-event: none;
        outline: none;
    }
    .elementa-interface.flag-gapping .elementa-gap-handle {
        background: #f082
    }
    .elementa-interface.flag-gapping .elementa-selection-controls {
        display: none;
    }
    .elementa-interface.flag-gapping .elementa-padding-handle {
        display: none;
    }
    .elementa-interface.flag-gapping .elementa-resize-handle {
        display: none;
    }
    .elementa-interface.flag-gapping .elementa-corner-handle {
        display: none;
    }

    /* space panning */

    .elementa-interface.space-panning {
        cursor: grab;
    }
    .elementa-interface.space-panning .elementa-layer-handle, .elementa-interface.space-panning .elementa-layer-content {
        display: none;
    }
`;
