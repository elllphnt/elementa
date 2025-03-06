import { useContext } from "react";
import { ContextMenuManagerContext } from "./context";

export function useContextMenuManager() {
  return useContext(ContextMenuManagerContext);
}
