import { useCallback, useContext } from "react";
import { useAnchorProvider } from "../anchor/hook";
import { ControlMenuContext } from "./_contexts";
import { ControlMenuOptions } from "./_types";

export function useControlMenu() {
  const anchorProvider = useAnchorProvider();
  const menuContext = useContext(ControlMenuContext);
  if (!menuContext) throw new Error("ControlMenuContext not found");

  const openMenu = useCallback(
    (options: ControlMenuOptions) => {
      menuContext.openMenu({
        ...options,
        anchor: options.anchor ?? anchorProvider.getAnchor(),
      });
    },
    [anchorProvider],
  );

  return {
    ...menuContext,
    openMenu,
  };
}
