import { PropsWithChildren } from "react";

export function DrawerError({ children }: PropsWithChildren<{}>) {
  return (
    <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg el-text-red el-text-center">
      {children}
    </div>
  );
}
