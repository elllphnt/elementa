import { useObservable } from "@repo/utils";
import { useContextMenuManager } from "./_";
import { ContextMenuCard } from "./context_menu_card";

export function ContextMenuView() {
  const manager = useContextMenuManager();
  const menu = useObservable(manager.menu$, manager.menu);

  if (!menu) {
    return null;
  }

  return (
    <ContextMenuCard
      key={menu.key}
      menu={menu}
      onClose={() => manager.hideMenu()}
    />
  );
}
