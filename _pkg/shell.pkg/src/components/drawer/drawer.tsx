import {
  ActionBar,
  ActionRegistry,
  ActionRegistryContext,
  AnchorProviderContext,
  elllIcons16,
  Icon,
  ViewComponent,
} from "@repo/components";
import cx from "classnames";
import { useMemo, useRef } from "react";
import { PANEL_COLLAPSE_SIZE } from "./_constants";
import { DrawerData } from "./_types";

export function Drawer({
  drawer,
  collapsed,
  onCollapse,
}: {
  drawer: DrawerData;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const actionRegistry = useMemo(() => new ActionRegistry(), []);

  return (
    <AnchorProviderContext.Provider
      value={{
        getAnchor: () => {
          return rootRef.current ?? undefined;
        },
      }}
    >
      <ActionRegistryContext.Provider value={actionRegistry}>
        <div ref={rootRef} className="el-h-full el-w-full el-flex el-flex-col">
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
              className={cx("el-h-4 el-w-4 fill-gray-600 el-mr-1 el-shrink-0")}
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
        </div>
      </ActionRegistryContext.Provider>
    </AnchorProviderContext.Provider>
  );
}
