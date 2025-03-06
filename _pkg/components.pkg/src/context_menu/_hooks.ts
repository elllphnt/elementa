import { useContext } from "react";
import { ContextMenuInnerContext } from "./_context";

export function useContextMenuInnerContext() {
  return useContext(ContextMenuInnerContext);
}
