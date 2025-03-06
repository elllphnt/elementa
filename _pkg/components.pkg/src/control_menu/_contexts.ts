import { createContext } from "react";
import { ControlMenuOptions } from "./_types";

export const ControlMenuContext = createContext<
  | {
      openMenu: (options: ControlMenuOptions) => void;
      closeMenu: () => void;
    }
  | undefined
>(undefined);
