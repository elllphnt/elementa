import React from "react";
import { ContextMenuManager } from "./context_menu_manager";

const defaultContextMenuManager = new ContextMenuManager();
export const ContextMenuManagerContext =
  React.createContext<ContextMenuManager>(defaultContextMenuManager);
