import { PropsWithChildren } from "react";

export function ModalContainer({
  title,
  height,
  width,
  children,
}: PropsWithChildren<{
  title: string;
  height: number;
  width: number;
}>) {
  return (
    <div
      style={{
        height,
        width,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        className="el-px-3 el-pt-2"
        style={{
          flexShrink: 0,
        }}
      >
        {title}
      </div>
      <div
        style={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
