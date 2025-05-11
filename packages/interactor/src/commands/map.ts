import * as componentHandlers from "./handlers/component";
import * as editingHandlers from "./handlers/editing";
import * as selectionHandlers from "./handlers/selection";
import * as toolsHandlers from "./handlers/tools";
import * as viewHandlers from "./handlers/view";
import * as viewportHandlers from "./handlers/viewport";
import { commands } from "./commands";

export const defaultCommandMap = {
  [commands.component.createComponent]: componentHandlers.createComponent,
  [commands.component.detachComponent]: componentHandlers.detachComponent,
  [commands.editing.undo]: editingHandlers.undo,
  [commands.editing.redo]: editingHandlers.redo,
  [commands.editing.copy]: editingHandlers.copy,
  [commands.editing.cut]: editingHandlers.cut,
  [commands.editing.paste]: editingHandlers.paste,
  [commands.editing.duplicate]: editingHandlers.duplicate,
  [commands.editing.deleteSelection]: editingHandlers.deleteSelection,
  [commands.editing.wrapSelection]: editingHandlers.wrapSelection,
  [commands.editing.unwrapSelection]: editingHandlers.unwrapSelection,
  [commands.editing.moveUp]: editingHandlers.moveUp,
  [commands.editing.moveDown]: editingHandlers.moveDown,
  [commands.editing.moveLeft]: editingHandlers.moveLeft,
  [commands.editing.moveRight]: editingHandlers.moveRight,
  [commands.editing.moveForward]: editingHandlers.moveForward,
  [commands.editing.moveBackward]: editingHandlers.moveBackward,
  [commands.selection.selectAll]: selectionHandlers.selectAll,
  [commands.tools.selectionTool]: toolsHandlers.selectionTool,
  [commands.tools.frameTool]: toolsHandlers.frameTool,
  [commands.tools.containerTool]: toolsHandlers.containerTool,
  [commands.tools.containerFilledTool]: toolsHandlers.containerFilledTool,
  [commands.tools.textTool]: toolsHandlers.textTool,
  [commands.tools.vectorTool]: toolsHandlers.vectorTool,
  [commands.tools.mediaTool]: toolsHandlers.mediaTool,
  [commands.view.toogleWireframe]: viewHandlers.toggleWireframe,
  [commands.viewport.zoomIn]: viewportHandlers.zoomIn,
  [commands.viewport.zoomOut]: viewportHandlers.zoomOut,
  [commands.viewport.fitIntoViewport]: viewportHandlers.fitIntoViewport,
};
