import { createContext } from "react";
import { ContextMenu } from "./_types";

export type ContextMenuInnerContext = {
  open: (menu: Omit<ContextMenu, "key">) => void;
  close: () => void;
};

export const ContextMenuInnerContext = createContext<ContextMenuInnerContext>({
  open: () => {},
  close: () => {},
});
