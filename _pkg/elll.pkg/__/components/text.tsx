import { PropsWithChildren } from "react";

export function ReadOnlyTextControl({
  children,
  value,
}: PropsWithChildren<{ value?: string }>) {
  return (
    <div className="el-h-7 el-w-full el-overflow-hidden el-text-ellipsis el-flex el-items-center">
      {value ?? children}
    </div>
  );
}
