import { File } from "@repo/backend";
import { ContextMenuOption } from "@repo/components";
import { createContext } from "react";

export type NewEntry = {
  type: string;
  parent: File;
};
export type RenameEntry = {
  file: File;
};

// events

export type ContextMenuEvent = {
  file: File;
  context?: FileTreeContextType;
};
export type NewEntryEvent = {
  parent: File;
  name: string;
  type: string;
};
export type ClickEvent = {
  file: File;
};

// handlers

export type HandleContextMenu = (
  event: ContextMenuEvent,
) => ContextMenuOption[][];
export type HandleNewEntry = (event: NewEntryEvent) => Promise<string | void>;
export type HandleClick = (event: ClickEvent) => boolean | void;
export type HandleDoubleClick = (event: ClickEvent) => boolean | void;

// context

export type FileTreeContextType = {
  // config
  stateKey?: string[];
  defaultFileType?: string;
  defaultFileTypeName?: string;
  hidden?: RegExp;
  // state
  newEntry?: NewEntry;
  renameEntry?: RenameEntry;
  setNewEntry?: (entry: NewEntry | undefined) => void;
  setRenameEntry?: (entry: RenameEntry | undefined) => void;
  // handlers
  handleContextMenu?: HandleContextMenu;
  handleNewEntry?: HandleNewEntry;
  handleClick?: HandleClick;
  handleDoubleClick?: HandleDoubleClick;
  // dragdrop
  acceptDrop?: (
    event: DragEvent,
    directory: File,
  ) => boolean | "copy" | "link" | "move";
  handleDrop?: (event: DragEvent, directory: File) => boolean;
};

export const FileTreeContext = createContext<FileTreeContextType | undefined>(
  undefined,
);
