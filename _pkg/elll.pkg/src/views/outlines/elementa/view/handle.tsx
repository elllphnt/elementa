import {
  ContextMenuOption,
  Icon,
  ScrollAreaContext,
  TreeContext,
  TreeEntry,
} from "@repo/components";
import { EntityHandle, Handle } from "@repo/elementa-interactor";
import { useDrag, useDrop, useShell } from "@repo/shell";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useContext, useEffect, useRef, useState } from "react";
import { mimeTypes } from "~/src/libs/mimetypes";
import { useWorkspaceState } from "../../../../hooks/shell/workspace";

function useContextMenuHandler(
  handle: EntityHandle,
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

export function EntityHandleOutlineEntry({
  handle,
  icon,
  fallbackName,
  content,
  container,
}: {
  icon: string;
  handle: EntityHandle;
  fallbackName?: string;
  content?: () => JSX.Element;
  container?: boolean;
}) {
  const [open, setOpen] = useEntityHandleOpenState(handle);
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useObservable(handle.hovered$, handle.hovered);
  const selected = useObservable(handle.selected$, handle.selected);
  const hasSelection = useObservable(handle.hasSelection$, handle.hasSelection);
  const handleContextMenu = useContextMenuHandler(handle);
  const { setFocus, focus } = useContext(ScrollAreaContext);
  const name = useObservable(handle.entity?.name$, handle.entity?.name);
  const [renaming, setRenaming] = useState(false);
  const context = useContext(TreeContext);

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

  const [dropRef, dropProps] = useDrop(
    {
      acceptDrop: (event) => {
        return handle.acceptDrop({
          datatypes: [...(event.dataTransfer?.types ?? [])],
        });
      },
      handleDrop: (event) => {
        handle.handleDrop(Handle.dropDataFromDragEvent(event));
      },
    },
    [],
  );
  const [dragRef] = useDrag(
    {
      getData: () => ({
        [mimeTypes.uriList]: handle.entity.url,
      }),
      getLabel: () => name || fallbackName || "Elementa Entity",
    },
    [handle.entity.url],
  );

  return (
    <div
      ref={(e) => {
        dropRef(e);
        dragRef(e);
      }}
      className={cx("el-space-y-0.5 el-rounded el-transition-colors", {
        "el-bg-pm/10": dropProps.isDropTarget,
      })}
    >
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

      {open && content ? (
        <TreeContext.Provider
          value={{
            ...context,
            depth: context.depth + 1,
          }}
        >
          {content()}
        </TreeContext.Provider>
      ) : null}
    </div>
  );
}

export function useEntityHandleOpenState(handle: EntityHandle) {
  return useWorkspaceState(
    ["elementa", "ouline", "views", handle.entity.id, "open"],
    true,
  );
}
