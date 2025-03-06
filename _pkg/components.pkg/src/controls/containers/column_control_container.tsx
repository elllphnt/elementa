import cx from "classnames";
import { PropsWithChildren, forwardRef, useMemo } from "react";
import { ActionRegistryContext } from "~/src/action/_contexts";
import { ActionRegistry } from "~/src/action/_model";
import { ActionBar } from "~/src/action/action_bar";

export const ColumnControlContainer = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    title?: string;
    indent?: boolean;
    noPadding?: boolean;
    noXPadding?: boolean;
    noYPadding?: boolean;
  }>
>(function (
  { children, title, indent, noPadding, noXPadding, noYPadding },
  ref,
) {
  const actionRegistry = useMemo(() => new ActionRegistry(), []);
  const hasHeader = title;
  return (
    <ActionRegistryContext.Provider value={actionRegistry}>
      <div
        ref={ref}
        className={cx("el-text-sm", {
          "el-px-3": !noXPadding && !noPadding,
          "el-py-3": !noYPadding && !noPadding,
        })}
      >
        {hasHeader && (
          <div
            className="el-font-semibold el-text-ellipsis el-w-full el-h-5"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                flexGrow: 1,
              }}
            >
              {title}
            </div>
            <ActionBar registry={actionRegistry} />
          </div>
        )}
        <div
          className={cx("el-space-y-2 empty:el-pt-0", {
            "el-pl-3": indent,
            "el-pt-3": hasHeader,
          })}
        >
          {children}
        </div>
      </div>
    </ActionRegistryContext.Provider>
  );
});
