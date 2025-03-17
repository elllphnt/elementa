import { Icon, Tooltip, ViewComponent } from "@repo/components";
import cx from "classnames";
import { useWorkspaceState } from "../../../hooks/shell/workspace";

export type TabPanelProps<D> = D & {
  stateKey: string[];
};

export type TabData<P extends {} = any> = {
  key: string;
  viewId?: string; // updated: viewId is now optional
  view?: React.FC<P>; // added optional view component property
  icon?: string;
  name: string | ((props: P) => string);
  enabled?: (props: P) => boolean;
};

export function TabContainer<P extends {} = {}>({
  stateKey,
  tabs,
  props = {} as P,
  hr,
  containerClassName,
  containerStyle,
  useIcon,
  trimFirst,
}: {
  stateKey: string[];
  tabs: TabData<P>[];
  props?: P;
  hr?: boolean;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  useIcon?: boolean;
  trimFirst?: boolean;
}): JSX.Element {
  const enabledTabs = tabs.filter((tab) => {
    if (tab.enabled) {
      return tab.enabled(props);
    } else {
      return true;
    }
  });
  const enabledTabsKey = enabledTabs.map((tab) => tab.key).join(",");
  let [activeTabKey, setActiveTabKey] = useWorkspaceState<string | undefined>([
    ...stateKey,
    "activeTabs",
    enabledTabsKey,
  ]);

  const activeTabData =
    enabledTabs.find((tab) => tab.key === activeTabKey) ?? enabledTabs[0];
  const TabView = activeTabData?.view; // extract view component if provided
  const viewId = activeTabData?.viewId;

  if (!viewId && !TabView) {
    // changed: now require at least one to be provided
    return <></>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          height: 35,
          flexShrink: 0,
        }}
      >
        <div
          className={cx("no-scrollbar", {
            // "el-px-2": useIcon,
          })}
          style={{
            width: "100%",
            height: "100%",
            overflowX: "auto",
            display: "flex",
            alignItems: "center",
            // justifyContent: useIcon?"center":
          }}
        >
          {enabledTabs.map((tab, index) => {
            const name =
              typeof tab.name === "function" ? tab.name(props) : tab.name;
            const trim = trimFirst && index === 0;

            return (
              <Tooltip
                key={tab.key}
                content={name}
                sideOffset={4}
                delayDuration={0}
              >
                <button
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontSize: "0.85em",
                    lineHeight: 1,
                  }}
                  className={cx({
                    "el-pr-3": trim,
                    "el-px-3": !trim,
                    "el-text-fg-500": tab.key === activeTabKey,
                    "el-text-fg-300 hover:el-text-fg-400":
                      tab.key !== activeTabKey,
                  })}
                  onClick={() => setActiveTabKey(tab.key)}
                >
                  {useIcon ? (
                    <Icon name={tab.icon} className="el-h-4 el-w-4" />
                  ) : (
                    name
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {hr ? <hr /> : <></>}
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
          ...containerStyle,
        }}
        className={containerClassName}
      >
        {TabView ? (
          // When a view component is provided, render it with priority.
          <TabView {...props} stateKey={[...stateKey, activeTabData.key]} />
        ) : (
          <ViewComponent
            key={activeTabData.key}
            id={viewId!} // using non-null assertion here since viewId exists if TabView is absent
            props={{
              ...props,
              stateKey: [...stateKey, activeTabData.key],
            }}
          />
        )}
      </div>
    </div>
  );
}

export default TabContainer;
