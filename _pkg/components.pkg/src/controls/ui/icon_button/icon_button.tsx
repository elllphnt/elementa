import cx from "classnames";
import { forwardRef } from "react";
import Icon from "~/src/icons/icon";

export const IconButton = forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements["button"] & {
    active?: boolean;
    icon?: string;
    iconClassName?: string;
    iconStyle?: React.CSSProperties;
  }
>(
  (
    { active, icon, style, className, iconClassName, iconStyle, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cx(
          "el-h-5 el-w-5 el-rounded hover:el-text-fg-800 el-shrink-0",
          {
            "el-text-fg-400 hover:el-bg-fg/5": !active,
            "el-text-fg-500": active,
          },
          className,
        )}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        }}
        {...props}
      >
        <Icon
          className={cx("el-h-4 el-w-4", iconClassName)}
          name={icon}
          style={iconStyle}
        />
      </button>
    );
  },
);
