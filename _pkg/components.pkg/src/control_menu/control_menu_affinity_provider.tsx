import React, { useContext } from "react";
import { ControlMenuContext } from "./_contexts";

export function ControlMenuAffinityProvider({
  children,
  affinity,
}: {
  children: React.ReactNode;
  affinity: "workspace" | "side";
}) {
  const { openMenu, closeMenu } = useContext(ControlMenuContext) ?? {};

  return (
    <ControlMenuContext.Provider
      value={{
        openMenu: (options) => {
          openMenu?.({
            affinity: affinity,
            ...options,
          });
        },
        closeMenu: closeMenu ?? (() => {}),
      }}
    >
      {children}
    </ControlMenuContext.Provider>
  );
}
