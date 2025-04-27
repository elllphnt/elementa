export const commands = {
  component: {
    createComponent: "component.create-component",
    detachComponent: "component.detach-component",
  },
  editing: {
    undo: "editing.undo",
    redo: "editing.redo",
    copy: "editing.copy",
    cut: "editing.cut",
    paste: "editing.paste",
    duplicate: "editing.duplicate",
    deleteSelection: "editing.delete-selection",
    wrapSelection: "editing.wrap-selection",
    unwrapSelection: "editing.unwrap-selection",
    moveUp: "editing.move-up",
    moveDown: "editing.move-down",
    moveLeft: "editing.move-left",
    moveRight: "editing.move-right",
    moveForward: "editing.move-forward",
    moveBackward: "editing.move-backward",
  },
  selection: {
    selectAll: "selection.select-all",
  },
  tools: {
    selectionTool: "tools.selection-tool",
    frameTool: "tools.frame-tool",
    containerTool: "tools.container-tool",
    containerFilledTool: "tools.container-filled-tool",
    textTool: "tools.text-tool",
    vectorTool: "tools.vector-tool",
    mediaTool: "tools.media-tool",
  },
  view: {
    toogleWireframe: "view.toogle-wireframe",
  },
  viewport: {
    zoomIn: "viewport.zoom-in",
    zoomOut: "viewport.zoom-out",
    zoomReset: "viewport.zoom-reset",
    fitIntoViewport: "viewport.fit-into-viewport",
  },
};
