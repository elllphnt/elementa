import React, { useCallback, useEffect, useState } from "react";
import { ContextMenuInnerContext } from "./_context";
import { ContextMenu } from "./_types";
import { ContextMenuGroupView } from "./context_menu_group";

export function ContextMenuCard({
  menu,
  onClose,
}: {
  menu: ContextMenu;
  onClose: () => void;
}) {
  const menuKeyRef = React.useRef(0);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const positionRef = React.useRef<{ x: number; y: number }>({
    x: menu.position.x,
    y: menu.position.y,
  });
  const [subMenu, setSubMenu] = useState<ContextMenu | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleRef = useCallback((root: HTMLDivElement | null) => {
    ref.current = root;
    if (!root) return;

    const padding = 24;
    const rect = root.getBoundingClientRect();
    const minX = padding;
    const minY = padding;
    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    const x = Math.max(minX, Math.min(menu.position.x, maxX));
    const y = Math.max(minY, Math.min(menu.position.y, maxY));

    positionRef.current = { x, y };
    setReady(true);
  }, []);

  return (
    <>
      <ContextMenuInnerContext.Provider
        value={{
          open: (menu) =>
            setSubMenu({
              key: menuKeyRef.current++,
              position: menu.position,
              options: menu.options,
            }),
          close: onClose,
        }}
      >
        <div
          ref={handleRef}
          className="el-bg-bg  el-shadow-md el-border el-rounded-lg"
          style={{
            position: "absolute",
            pointerEvents: "auto",
            top: positionRef.current.y,
            left: positionRef.current.x,
            zIndex: 1000,
            minWidth: 240,
            visibility: ready ? "visible" : "hidden",
          }}
        >
          {menu.options.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <hr />}
              <ContextMenuGroupView group={item} />
            </React.Fragment>
          ))}
        </div>
      </ContextMenuInnerContext.Provider>

      {subMenu && (
        <ContextMenuCard menu={subMenu} onClose={() => setSubMenu(undefined)} />
      )}
    </>
  );
}
