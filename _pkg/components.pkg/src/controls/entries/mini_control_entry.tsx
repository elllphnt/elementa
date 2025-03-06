import cx from "classnames";
import { PropsWithChildren, ReactNode, forwardRef } from "react";
import { useControlMenu } from "~/src/control_menu/_hooks";
import { ControlMenuOptions } from "~/src/control_menu/_types";
import { RemoveButton } from "./remove_button";

function MiniControlEntryLabel({
  menu,
  label,
  active,
  onRemove,
}: {
  label?: React.ReactNode;
  menu?: ControlMenuOptions;
  active?: boolean;
  onRemove?: () => void;
}) {
  const { openMenu } = useControlMenu();
  const hasMenu = !!menu;

  return (
    <div
      style={{
        flexShrink: 0,
        position: "relative",
        display: "flex",
        alignItems: "center",
        textAlign: "start",
      }}
      className={cx("el-h-7 ", {
        "el-text-fg-400": !active,
        "hover:el-text-fg-500": !active && hasMenu,
        "el-text-pm": active,
        "el-text-pm hover:el-text-pm-500": active && hasMenu,
      })}
    >
      {onRemove ? <RemoveButton onRemove={onRemove} /> : <></>}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          textAlign: "start",
          width: 16,
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
        {label}
      </button>
    </div>
  );
}

export const MiniControlEntry = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{
    icon?: ReactNode;
    label?: ReactNode;
    menu?: ControlMenuOptions;
    active?: boolean;
    onRemove?: () => void;
  }>
>(function ({ label, icon, children, menu, active, onRemove }, ref) {
  let _label = icon ?? label;
  if (typeof _label === "string") {
    _label = _label[0].toLocaleUpperCase();
  }

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        width: "calc(50% - 12px)",
      }}
    >
      {_label ? (
        <MiniControlEntryLabel
          label={_label}
          menu={menu}
          active={active}
          onRemove={onRemove}
        />
      ) : (
        <></>
      )}
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
});
