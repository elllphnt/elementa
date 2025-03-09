import {
  ActionBar,
  ActionRegistry,
  ActionRegistryContext,
  AnchorProviderContext,
  elllIcons16,
  Icon,
  ProgressBar,
  ViewComponent,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useContext, useMemo, useRef } from "react";
import { BehaviorSubject } from "rxjs";
import { PANEL_COLLAPSE_SIZE } from "./_constants";
import { DrawerContext } from "./_context";
import { DrawerData } from "./_types";

function DrawerLoader() {
  const context = useContext(DrawerContext);
  const loading = useObservable(context?.loading$, context?.loading$.value);

  if (!loading) {
    return <></>;
  }

  return (
    <div
      className="el-text-pm"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <ProgressBar naked />
    </div>
  );
}

export function Drawer({
  drawer,
  collapsed,
  onCollapse,
}: {
  drawer: DrawerData;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}) {
  const loading$ = useMemo(() => new BehaviorSubject<boolean>(false), []);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const actionRegistry = useMemo(() => new ActionRegistry(), []);

  return (
    <DrawerContext.Provider value={{ loading$ }}>
      <AnchorProviderContext.Provider
        value={{
          getAnchor: () => {
            return rootRef.current ?? undefined;
          },
        }}
      >
        <ActionRegistryContext.Provider value={actionRegistry}>
          <div
            ref={rootRef}
            className="el-h-full el-w-full el-flex el-flex-col"
          >
            <div
              className="el-font-semibold el-px-1 el-text-sm el-text-ellipsis el-w-full el-flex el-items-center el-cursor-pointer el-flex-shrink-0"
              style={{
                lineHeight: 1,
                height: PANEL_COLLAPSE_SIZE,
              }}
              onClick={() => {
                onCollapse(!collapsed);
              }}
            >
              <Icon
                name={elllIcons16.chevron}
                className={cx(
                  "el-h-4 el-w-4 fill-gray-600 el-mr-1 el-shrink-0",
                )}
                style={{
                  transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
                }}
              />
              <span className="block grow">{drawer.title}</span>
              {collapsed ? (
                <></>
              ) : (
                <div
                  style={{
                    marginLeft: "auto",
                    padding: "0 4px",
                  }}
                >
                  <ActionBar registry={actionRegistry} />
                </div>
              )}
            </div>
            <div className="el-grow el-overflow-hidden">
              <ViewComponent key={drawer.viewId} id={drawer.viewId} />
            </div>

            <DrawerLoader />
          </div>
        </ActionRegistryContext.Provider>
      </AnchorProviderContext.Provider>
    </DrawerContext.Provider>
  );
}
