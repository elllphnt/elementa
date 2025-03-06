import { EdgeResizeHandle, ScrollArea, StaticSplit } from "@repo/components";
import {
  normalizeSplit,
  resizeSplit,
  useManyObservables,
  useRect,
} from "@repo/utils";
import { useRef, useState } from "react";
import { useWorkspace } from "../../hooks/workspace";
import { PANEL_COLLAPSE_SIZE, PANEL_MIN_SIZE } from "./_constants";
import { DrawerData } from "./_types";
import { Drawer } from "./drawer";

export function DrawerContainer({
  stateKey,
  drawers,
}: {
  stateKey: string[];
  drawers: DrawerData[];
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRect(ref);
  const workspace = useWorkspace();
  const drawerStatesKey = drawers.map((drawer) => drawer.key).join("-");
  const _sizes = useManyObservables(
    drawers.map((drawer) =>
      workspace.state.value$([...stateKey, drawer.key, "size"], 1),
    ),
    drawers.map((drawer) =>
      workspace.state.value([...stateKey, drawer.key, "size"], 1),
    ),
    drawerStatesKey,
  );
  const collapseds = useManyObservables(
    drawers.map((drawer) =>
      workspace.state.value$([...stateKey, drawer.key, "collapsed"], false),
    ),
    drawers.map((drawer) =>
      workspace.state.value([...stateKey, drawer.key, "collapsed"], false),
    ),
    drawerStatesKey,
  );
  const resizeRef = useRef<{
    initialSizes: number[];
  }>();
  const [resizing, setResizing] = useState(false);

  // remove collapsed panels from the sizes array
  const _sizesWithoutCollapsed: number[] = [];
  const _sizeIndexMap: number[] = []; // maps from the index in _sizesWithoutCollapsed to the index in _sizes
  for (let i = 0; i < drawers.length; i++) {
    if (!collapseds[i]) {
      _sizesWithoutCollapsed.push(_sizes[i]);
      _sizeIndexMap.push(i);
    }
  }

  // normalize the sizes without the collapsed panels
  const totalSize = rect?.height;
  const totalSizeWithoutCollapsed = totalSize
    ? totalSize -
      (_sizes.length - _sizesWithoutCollapsed.length) * PANEL_COLLAPSE_SIZE
    : totalSize;
  const sizesWithoutCollapsed = totalSizeWithoutCollapsed
    ? normalizeSplit(
        _sizesWithoutCollapsed,
        PANEL_MIN_SIZE,
        totalSizeWithoutCollapsed,
        true,
      )
    : _sizesWithoutCollapsed;

  // reinsert the collapsed panels into the sizes array
  const sizes: number[] = Array.from(
    { length: _sizes.length },
    (_, i) => PANEL_COLLAPSE_SIZE,
  );
  for (let i = 0; i < sizesWithoutCollapsed.length; i++) {
    const size = sizesWithoutCollapsed[i];
    const sizeIndex = _sizeIndexMap[i];
    sizes[sizeIndex] = size;
  }

  // a drawer is resizable if it is not collapsed and is succeeded by a panel that is not collapsed
  const resizableDrawers = new Set<string>();

  let nonCollapsedDrawer: string | undefined;
  for (let i = drawers.length - 1; i >= 0; i--) {
    const drawer = drawers[i];
    const collapsed = collapseds[i];
    if (collapsed) {
      continue;
    }
    if (nonCollapsedDrawer) {
      resizableDrawers.add(drawer.key);
    }
    nonCollapsedDrawer = drawer.key;
  }

  const handleResizeStart = () => {
    resizeRef.current = {
      initialSizes: [...sizesWithoutCollapsed],
    };
    setResizing(true);
  };
  const handleResizeUpdate = (index: number, size: number) => {
    const { initialSizes } = resizeRef.current!;
    const newSizes = resizeSplit(initialSizes, index, size, PANEL_MIN_SIZE);
    for (let i = 0; i < newSizes.length; i++) {
      const drawerIndex = _sizeIndexMap[i];
      const drawer = drawers[drawerIndex];
      workspace.state.set([...stateKey, drawer.key, "size"], newSizes[i]);
    }
  };
  const handleResizeEnd = () => {
    setResizing(false);
  };

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <ScrollArea scrollY containerClassName="el-w-full">
        {totalSize ? (
          <StaticSplit
            orientation="vertical"
            segments={sizes}
            transition={!resizing}
          >
            {drawers.map((drawer, index) => {
              const isResizable = resizableDrawers.has(drawer.key);
              const withouCollapsedIndex = _sizeIndexMap.indexOf(index);
              const edgeIndex = withouCollapsedIndex + 1; // the edge after the panel
              return (
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  key={drawer.key}
                >
                  {index > 0 && (
                    <hr
                      style={{
                        position: "absolute",
                        top: -0.5,
                        left: 0,
                        right: 0,
                      }}
                    />
                  )}
                  {
                    <Drawer
                      drawer={drawer}
                      collapsed={collapseds[index]}
                      onCollapse={(collapsed) => {
                        workspace.state.set(
                          [...stateKey, drawer.key, "collapsed"],
                          collapsed,
                        );
                      }}
                    />
                  }
                  {isResizable && (
                    <EdgeResizeHandle
                      offset={-1}
                      edge="bottom"
                      onResizeStart={() => handleResizeStart()}
                      onResizeUpdate={(size) =>
                        handleResizeUpdate(edgeIndex, size)
                      }
                      onResizeEnd={() => handleResizeEnd()}
                      style={{ zIndex: 1 }}
                    />
                  )}
                </div>
              );
            })}
          </StaticSplit>
        ) : (
          <></>
        )}
      </ScrollArea>
    </div>
  );
}
