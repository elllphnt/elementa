import * as RadixScrollArea from "@radix-ui/react-scroll-area";
import cx from "classnames";
import { PropsWithChildren } from "react";

export function ScrollArea({
  children,
  scrollX,
  scrollY,
  containerStyle,
  containerClassName,
  rootStyle,
  rootClassName,
  noHandle,
  containerRef,
  type,
}: PropsWithChildren<{
  scrollX?: boolean;
  scrollY?: boolean;
  rootClassName?: string;
  rootStyle?: React.CSSProperties;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  containerRef?: React.RefObject<HTMLDivElement>;
  noHandle?: boolean;
  type?: "auto" | "scroll" | "always" | "hover";
}>): JSX.Element {
  return (
    <RadixScrollArea.Root
      className={cx("el-h-full el-w-full", rootClassName)}
      style={rootStyle}
      type={type}
    >
      <RadixScrollArea.Viewport
        asChild
        className="!el-block"
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <div
          ref={containerRef}
          className={containerClassName}
          style={containerStyle}
        >
          {children}
        </div>
      </RadixScrollArea.Viewport>
      {scrollY ? (
        <RadixScrollArea.Scrollbar
          className="el-flex el-flex-col el-h-full el-touch-none el-select-none el-w-4 el-p-1"
          orientation="vertical"
          style={{
            visibility: noHandle ? "hidden" : "visible",
            zIndex: 1000,
          }}
        >
          <RadixScrollArea.Thumb
            className="el-relative el-bg-fg/10 hover:el-bg-fg/20 el-cursor-pointer"
            style={{
              borderRadius: 400,
              backdropFilter: "blur(2px)",
            }}
          />
        </RadixScrollArea.Scrollbar>
      ) : (
        <></>
      )}

      {scrollX ? (
        <RadixScrollArea.Scrollbar
          className="el-flex el-flex-row el-w-full el-touch-none el-select-none el-h-4 el-p-1"
          orientation="horizontal"
          style={{
            visibility: noHandle ? "hidden" : "visible",
            zIndex: 1000,
          }}
        >
          <RadixScrollArea.Thumb
            className="el-relative el-bg-fg/10"
            style={{
              borderRadius: 3,
              backdropFilter: "blur(2px)",
            }}
          />
        </RadixScrollArea.Scrollbar>
      ) : (
        <></>
      )}
    </RadixScrollArea.Root>
  );
}

export default ScrollArea;
