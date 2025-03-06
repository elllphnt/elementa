import { commands } from "../commands/commands";
import { KeyMapping } from "./keymapper";

export const defaultKeymap: KeyMapping[] = [
  // component
  {
    key: "ctrl+k",
    command: commands.component.createComponent,
  },
  {
    key: "ctrl+shift+k",
    command: commands.component.detachComponent,
  },

  // editing
  {
    key: "ctrl+z",
    command: commands.editing.undo,
  },
  {
    key: "ctrl+shift+z",
    command: commands.editing.redo,
  },
  {
    key: "ctrl+c",
    command: commands.editing.copy,
  },
  {
    key: "ctrl+x",
    command: commands.editing.cut,
  },
  {
    key: "ctrl+v",
    command: commands.editing.paste,
  },
  {
    key: "ctrl+d",
    command: commands.editing.duplicate,
  },
  {
    key: "delete",
    command: commands.editing.deleteSelection,
  },
  {
    key: "ctrl+g",
    command: commands.editing.wrapSelection,
  },
  {
    key: "ctrl+shift+g",
    command: commands.editing.unwrapSelection,
  },
  {
    key: "arrowup",
    command: commands.editing.moveUp,
  },
  {
    key: "arrowdown",
    command: commands.editing.moveDown,
  },
  {
    key: "arrowleft",
    command: commands.editing.moveLeft,
  },
  {
    key: "arrowright",
    command: commands.editing.moveRight,
  },
  {
    key: "ctrl+]",
    command: commands.editing.moveForward,
  },
  {
    key: "ctrl+[",
    command: commands.editing.moveBackward,
  },

  // view
  {
    key: "ctrl+y",
    command: commands.view.toogleWireframe,
  },

  // viewport
  {
    key: "ctrl+0",
    command: commands.viewport.fitIntoViewport,
  },
  {
    key: "ctrl+=",
    command: commands.viewport.zoomIn,
  },
  {
    key: "ctrl+-",
    command: commands.viewport.zoomOut,
  },
];
