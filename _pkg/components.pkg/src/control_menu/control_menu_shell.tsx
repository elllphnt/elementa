import { useCallback, useState } from "react";
import { ControlMenuContext } from "./_contexts";
import { useControlMenu } from "./_hooks";
import { ControlMenu, ControlMenuOptions } from "./_types";
import { ControlMenuContent } from "./menu_content";

export function ControlMenuShell({ menu }: { menu: ControlMenu }): JSX.Element {
  const [stack, setStack] = useState<ControlMenu[]>([menu]);
  const { closeMenu, openMenu } = useControlMenu();

  const push = useCallback(
    (menu: ControlMenu) => {
      setStack((prev) => [...prev, menu]);
      return "";
    },
    [setStack],
  );
  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      } else {
        return prev;
      }
    });
  }, [setStack]);

  const handleOpenMenu = useCallback(
    (options: ControlMenuOptions) => {
      if (
        options.affinity &&
        ["workspace", "side"].includes(options.affinity)
      ) {
        openMenu(options);
      } else {
        push(options);
      }
    },
    [push],
  );

  return (
    <ControlMenuContext.Provider
      value={{ openMenu: handleOpenMenu, closeMenu: pop }}
    >
      <ControlMenuContent
        key={menu.key ?? stack.length}
        menu={stack[stack.length - 1]}
        onBack={stack.length > 1 ? pop : undefined}
        onClose={closeMenu}
      />
    </ControlMenuContext.Provider>
  );
}
