import {
  ContextMenuOption,
  Icon,
  ScrollAreaContext,
  TreeEntry,
} from "@repo/components";
import { Handle } from "@repo/elementa-interactor";
import { useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useContext, useEffect, useRef, useState } from "react";
import { useWorkspaceState } from "../../../../hooks/shell/workspace";

function useContextMenuHandler(
  handle: Handle,
  getOptions: () => ContextMenuOption[][] = () => [],
) {
  const shell = useShell();

  return (e: React.MouseEvent) => {
    e.preventDefault();

    shell.showContextMenu({
      position: {
        x: e.clientX,
        y: e.clientY,
      },
      options: [
        ...getOptions(),
        [
          {
            label: "Delete",
            action: () => {
              handle.entity.remove();
            },
          },
        ],
      ],
    });
  };
}

export function HandleOutlineEntry({
  handle,
  icon,
  open,
  setOpen,
  container,
  fallbackName,
}: {
  icon: string;
  handle: Handle;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  container?: boolean;
  fallbackName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useObservable(handle.hovered$, handle.hovered);
  const selected = useObservable(handle.selected$, handle.selected);
  const hasSelection = useObservable(handle.hasSelection$, handle.hasSelection);
  const handleContextMenu = useContextMenuHandler(handle);
  const { setFocus, focus } = useContext(ScrollAreaContext);
  const name = useObservable(handle.entity?.name$, handle.entity?.name);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (selected && ref.current && focus !== ref.current) {
      setFocus?.(ref.current);
    }
  }, [selected]);

  useEffect(() => {
    if (hasSelection && !open) {
      setOpen?.(true);
    }
  }, [hasSelection]);

  return (
    <>
      <TreeEntry
        ref={ref}
        hover={hovered}
        active={selected}
        nested
        container={container}
        accent
        icon={<Icon className="el-text-blue" name={icon} />}
        onMouseEnter={() => handle.hover()}
        onMouseLeave={() => handle.unhover()}
        onClick={() => handle.select()}
        open={open}
        onToggleOpen={setOpen}
        onContextMenu={handleContextMenu}
        onDoubleClick={() => setRenaming(true)}
      >
        {renaming ? (
          <input
            autoFocus
            value={name}
            placeholder="Name"
            onBlur={() => setRenaming(false)}
            onChange={(e) => handle.entity.setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            style={{
              width: "100%",
              border: "none",
              background: "none",
              outline: "none",
            }}
          />
        ) : (
          name || fallbackName
        )}
      </TreeEntry>
    </>
  );
}

export function useHandleOpenState(handle: Handle) {
  return useWorkspaceState(
    ["elementa", "ouline", "views", handle.entity.id, "open"],
    true,
  );
}
