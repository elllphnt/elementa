import cx from "classnames";
import React, { PropsWithChildren, forwardRef } from "react";
import { useControlMenu } from "~/src/control_menu/_hooks";
import { ControlMenuOptions } from "~/src/control_menu/_types";
import Icon from "~/src/icons/icon";
import { Tooltip } from "~/src/tooltip";
import { RemoveButton } from "./remove_button";

function FullControlEntryLabel({
  menu,
  label,
  active,
  onRemove,
  quickAction,
}: {
  label?: React.ReactNode;
  menu?: ControlMenuOptions;
  active?: boolean;
  quickAction?: {
    icon: string;
    label: string;
    handler: () => void;
  };
  onRemove?: () => void;
}) {
  const { openMenu } = useControlMenu();
  const hasMenu = !!menu;

  return (
    <div
      style={{
        width: "40%",
        display: "flex",
        alignItems: "center",
        position: "relative",
        flexShrink: 0,
      }}
      className={cx("el-h-7", {
        "el-text-fg-400": !active,
        "hover:el-text-fg-500": !active && hasMenu,
        "el-text-pm-300": active,
        "el-text-pm-300 hover:el-text-pm-500": active && hasMenu,
      })}
    >
      {onRemove ? <RemoveButton onRemove={onRemove} /> : <></>}
      <div className="el-group el-grow el-h-full el-overflow-hidden el-flex el-items-center el-gap-1">
        <button
          className="el-h-full"
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            textAlign: "start",
            overflow: "hidden",
          }}
          disabled={!hasMenu}
          onClick={(e) => {
            if (menu) {
              openMenu({
                anchor: e.currentTarget,
                ...menu,
              });
            }
          }}
        >
          <div
            style={{
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              textWrap: "nowrap",
              position: "relative",
            }}
          >
            {label}
          </div>
        </button>
        {quickAction ? (
          <div className="el-hidden group-hover:el-block el-opacity-50 hover:el-opacity-100 el-shrink-0">
            <Tooltip content={quickAction.label} sideOffset={4}>
              <button
                onClick={quickAction.handler}
                className="el-h-4 el-w-4 el-items-center el-justify-center el-flex"
              >
                <Icon name={quickAction.icon} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export const FullControlEntry = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    label?: React.ReactNode;
    icon?: React.ReactNode;
    menu?: ControlMenuOptions;
    active?: boolean;
    onRemove?: () => void;
    action?: {
      icon: string;
      label: string;
      handler: () => void;
      active?: boolean;
    };
    quickAction?: {
      icon: string;
      label: string;
      handler: () => void;
    };
  }>
>(function (
  { active, menu, label, children, onRemove, action, quickAction },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 8,
        width: "100%",
      }}
    >
      {label ? (
        <FullControlEntryLabel
          active={active}
          menu={menu}
          label={label}
          onRemove={onRemove}
          quickAction={quickAction}
        />
      ) : null}
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
        className="el-flex el-gap-2"
      >
        <div className="el-grow el-overflow-hidden">{children}</div>
        {action ? (
          <div className="el-shrink-0">
            <Tooltip content={action.label}>
              <button
                onClick={action.handler}
                className={cx(
                  "el-h-7 el-w-7 el-rounded el-shrink-0 el-items-center el-justify-center el-flex el-border",
                  {
                    "el-bg-fg/10 hover:el-bg-fg/20": action.active,
                    "hover:el-bg-fg/5": !action.active,
                  },
                )}
              >
                <Icon name={action.icon} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
});
