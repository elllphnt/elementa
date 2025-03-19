import { PropsWithChildren } from "react";

export function ControlMenuContainer({
  children,
}: PropsWithChildren<{}>): JSX.Element {
  return <div className="el-p-3 el-space-y-2">{children}</div>;
}
