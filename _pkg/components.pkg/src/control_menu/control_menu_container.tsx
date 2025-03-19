import cx from "classnames";
import React from "react";

export function ControlMenuContainer({
  children,
  className,
  ...props
}: React.JSX.IntrinsicElements["div"]): JSX.Element {
  return (
    <div className={cx("el-p-3 el-space-y-2", className)} {...props}>
      {children}
    </div>
  );
}
