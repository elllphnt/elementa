import { Icon, Tooltip } from "@repo/components";
import cx from "classnames";

export type TabData<P extends {} = any> = {
  key: string;
  icon?: string;
  name: string;
};

export function Tabs<P extends {} = {}>({
  tabs,
  useIcon,
  trimFirst,
  active,
  setActive,
}: {
  tabs: TabData<P>[];
  useIcon?: boolean;
  trimFirst?: boolean;
  active?: string;
  setActive?: (key: string) => void;
}): JSX.Element {
  return (
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
        {tabs.map((tab, index) => {
          const name = tab.name;
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
                  "el-text-fg-500": tab.key === active,
                  "el-text-fg-300 hover:el-text-fg-400": tab.key !== active,
                })}
                onClick={() => setActive?.(tab.key)}
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
  );
}

export default Tabs;
