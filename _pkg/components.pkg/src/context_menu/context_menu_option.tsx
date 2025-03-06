import React from "react";
import Icon from "../icons/icon";
import { useContextMenuInnerContext } from "./_hooks";
import { ContextMenuOption } from "./_types";

export function ContextMenuOptionView({
  option,
}: {
  option: ContextMenuOption;
}) {
  const controller = useContextMenuInnerContext();
  let subMenu: ContextMenuOption[][] | undefined = undefined;

  if ("submenu" in option) {
    subMenu = option.submenu;
  }

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if ("action" in option) {
      option.action();
      controller.close();
    } else if (subMenu) {
      const targetRect = event.currentTarget.getBoundingClientRect();

      const options = subMenu;
      // use setTimeout to avoid the click event from closing the menu
      setTimeout(
        () =>
          controller.open({
            position: {
              x: targetRect.left + targetRect.width + 4,
              y: targetRect.top,
            },
            options,
          }),
        0,
      );
    }
  };

  return (
    <button
      className="el-h-7 el-px-2 el-rounded hover:el-bg-bg-300/20 el-flex el-items-center"
      style={{
        cursor: "pointer",
        gap: 8,
        textAlign: "start",
      }}
      onClick={handleClick}
    >
      <div className="el-h-4 el-w-4 el-shrink-0">
        {option.icon && typeof option.icon === "string" ? (
          <Icon name={option.icon} />
        ) : (
          option.icon
        )}
      </div>
      <div className="grow">{option.label}</div>
      {subMenu && (
        <div className="el-h-4 el-w-4 el-shrink-0">
          <Icon />
        </div>
      )}
    </button>
  );
}
