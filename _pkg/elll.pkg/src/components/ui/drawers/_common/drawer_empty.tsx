import { PropsWithChildren } from "react";

export function DrawerEmpty({
  children,
}: PropsWithChildren<{
  icon?: string;
}>) {
  return (
    <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg-300 el-text-center el-p-3">
      {children}
    </div>
  );
}
