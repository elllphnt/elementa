import cx from "classnames";
import React, { PropsWithChildren, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExclusiveBox, exlusiveBoxIgnoreClassName } from "./exclusive_box";

function getPopperRect({
  anchorRect,
  popperRect,
  position,
  align,
  offset,
}: {
  anchorRect: DOMRect;
  popperRect: DOMRect;
  position: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end" | "stretch";
  offset: number;
}) {
  let x = 0;
  let y = 0;
  let width = "auto" as "auto" | number;
  let height = "auto" as "auto" | number;

  switch (position) {
    case "top":
      y = anchorRect.top - offset - popperRect.height;
      break;
    case "bottom":
      y = anchorRect.bottom + offset;
      break;
    case "left":
      x = anchorRect.left - offset - popperRect.width;
      break;
    case "right":
      x = anchorRect.right + offset;
      break;
  }

  if (position === "top" || position === "bottom") {
    switch (align) {
      case "start":
        x = anchorRect.left;
        break;
      case "center":
        x = anchorRect.left + anchorRect.width / 2 - popperRect.width / 2;
        break;
      case "end":
        x = anchorRect.right - popperRect.width;
        break;
      case "stretch":
        x = anchorRect.left;
        width = anchorRect.width;
        break;
    }
  }

  if (position === "left" || position === "right") {
    switch (align) {
      case "start":
        y = anchorRect.top;
        break;
      case "center":
        y = anchorRect.top + anchorRect.height / 2 - popperRect.height / 2;
        break;
      case "end":
        y = anchorRect.bottom - popperRect.height;
        break;
      case "stretch":
        y = anchorRect.top;
        height = anchorRect.height;
        break;
    }
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const maxX = windowWidth - popperRect.width - 12;
  const maxY = windowHeight - popperRect.height - 12;
  const minX = 12;
  const minY = 12;

  x = Math.min(Math.max(x, minX), maxX);
  y = Math.min(Math.max(y, minY), maxY);

  return { x, y, width, height };
}

export function Popper({
  anchor,
  position,
  align,
  offset,
  children,
  exclusive,
  onClose,
  filled,
  border,
  shadow,
}: PropsWithChildren<{
  anchor?: HTMLElement;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end" | "stretch";
  exclusive?: boolean;
  offset?: number;
  onClose?: () => void;
  filled?: boolean;
  border?: boolean;
  shadow?: boolean;
}>): JSX.Element {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [{ x, y, width, height }, setRect] = useState({
    x: 0,
    y: 0,
    width: 0 as "auto" | number,
    height: 0 as "auto" | number,
  });

  useLayoutEffect(() => {
    if (!ref.current) return;
    if (!anchor) return;

    const popperRect = ref.current.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    setRect(
      getPopperRect({
        anchorRect,
        popperRect,
        position: position || "bottom",
        align: align || "start",
        offset: offset || 0,
      }),
    );
  }, [align, anchor, offset, position]);

  if (!anchor) return <></>;

  let transform = "";

  const style: React.CSSProperties = {
    position: "fixed",
    zIndex: 1000,
    top: y,
    left: x,
    width: width || "auto",
    height: height || "auto",
    transform,
  };
  const className = cx(
    {
      "el-rounded": filled || border,
      "el-bg-bg ": filled,
      "el-border": border,
      "el-shadow-md": shadow,
    },
    exlusiveBoxIgnoreClassName,
  );

  let content = <></>;

  if (exclusive) {
    content = (
      <ExclusiveBox
        onRef={(el) => {
          ref.current = el;
        }}
        className={className}
        style={style}
        onClose={onClose || (() => {})}
      >
        {children}
      </ExclusiveBox>
    );
  } else {
    content = (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return createPortal(content, document.body);
}

export default Popper;
