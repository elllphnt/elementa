import React, { PropsWithChildren } from "react";

export function SideModalContainer({
  side,
  children,
  padding = 0,
  flushCrossSide = false,
}: PropsWithChildren<{
  side: "left" | "right" | "top" | "bottom";
  padding?: number;
  flushCrossSide?: boolean;
}>): JSX.Element {
  const style: React.CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 900,
  };

  switch (side) {
    case "left":
      style.left = -padding;
      style.top = flushCrossSide ? 0 : padding;
      style.bottom = flushCrossSide ? 0 : padding;
      style.transform = "translateX(-100%)";
      break;
    case "right":
      style.right = -padding;
      style.top = flushCrossSide ? 0 : padding;
      style.bottom = flushCrossSide ? 0 : padding;
      style.transform = "translateX(100%)";
      break;
    case "top":
      style.top = -padding;
      style.left = flushCrossSide ? 0 : padding;
      style.right = flushCrossSide ? 0 : padding;
      style.transform = "translateY(-100%)";
      break;
    case "bottom":
      style.bottom = -padding;
      style.left = flushCrossSide ? 0 : padding;
      style.right = flushCrossSide ? 0 : padding;
      style.transform = "translateY(100%)";
      break;
  }

  let sub = <></>;

  return <div style={style}>{children}</div>;
}

export default SideModalContainer;
