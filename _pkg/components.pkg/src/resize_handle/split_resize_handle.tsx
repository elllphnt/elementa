import cx from "classnames";
import { CSSProperties, useRef, useState } from "react";

export type SplitResizeHandleProps = JSX.IntrinsicElements["div"] & {
  direction: "row" | "column";
  offset?: number | string;
  weight?: number;
  markerWeight?: number;
  onResizeStart?: (event: React.MouseEvent) => void;
  onResizeUpdate?: (
    delta: number,
    movementDelta: number,
    event: MouseEvent,
  ) => void;
  onResizeEnd?: (event: MouseEvent) => void;
  active?: boolean;
  align?: "start" | "end" | "center";
};

export const SplitResizeHandle: React.FC<SplitResizeHandleProps> = ({
  weight = 4,
  offset = 0,
  markerWeight = 2,
  align = "center",
  direction,
  onResizeStart,
  onResizeUpdate,
  onResizeEnd,
  style,
  active,
  onMouseEnter,
  onMouseDown,
  onMouseLeave,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const callbacks = useRef({
    onResizeStart,
    onResizeUpdate,
    onResizeEnd,
  });
  callbacks.current = {
    onResizeStart,
    onResizeUpdate,
    onResizeEnd,
  };
  const hoverRef = useRef<number>();

  let handleStyle: CSSProperties = {};
  let markerStyle: CSSProperties = {};

  switch (direction) {
    case "column":
      handleStyle = {
        left: 0,
        right: 0,
        height: weight,
        top: offset,
        cursor: "ns-resize",
        display: "flex",
        flexDirection: "column",
        justifyContent: align,
        transform:
          align === "center"
            ? "translateY(-50%)"
            : align === "end"
              ? "translateY(-100%)"
              : undefined,
      };
      markerStyle = {
        width: "100%",
        height: markerWeight,
      };
      break;
    case "row":
      handleStyle = {
        top: 0,
        bottom: 0,
        width: weight,
        left: offset,
        cursor: "ew-resize",
        display: "flex",
        flexDirection: "row",
        justifyContent: align,
        transform:
          align === "center"
            ? "translateX(-50%)"
            : align === "end"
              ? "translateX(-100%)"
              : undefined,
      };
      markerStyle = {
        height: "100%",
        width: markerWeight,
      };
      break;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const initialPointerEvents = new Map<HTMLElement, string>();

    // disable pointer events on all iframes
    for (const iframe of document.querySelectorAll("iframe")) {
      initialPointerEvents.set(iframe, iframe.style.pointerEvents);
      iframe.style.pointerEvents = "none";
    }

    const start = direction === "column" ? e.clientY : e.clientX;
    callbacks.current.onResizeStart?.(e);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const current = direction === "column" ? e.clientY : e.clientX;

      switch (direction) {
        case "column":
          callbacks.current.onResizeUpdate?.(current - start, e.movementY, e);
          break;
        case "row":
          callbacks.current.onResizeUpdate?.(current - start, e.movementX, e);
          break;
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      for (const [element, pointerEvents] of initialPointerEvents) {
        element.style.pointerEvents = pointerEvents;
      }
      setIsDragging(false);
      callbacks.current.onResizeEnd?.(e);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.preventDefault();

    hoverRef.current = setTimeout(() => {
      setHover(true);
    }, 200) as any;
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    setHover(false);
    clearTimeout(hoverRef.current);
  };

  return (
    <div
      className={cx("el-transition-opacity", {
        "el-opacity-1":
          active !== undefined ? active || hover : isDragging || hover,
        "el-opacity-0":
          active !== undefined ? !active && !hover : !isDragging && !hover,
      })}
      style={{
        ...handleStyle,
        ...style,
        position: "absolute",
        zIndex: 10,
        pointerEvents: "auto",
        // transitionDelay: isDragging ? "0s" : "0.2s",
      }}
      onMouseDown={(e) => {
        onMouseDown?.(e);
        handleMouseDown(e);
      }}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        handleMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        handleMouseLeave(e);
      }}
      {...props}
    >
      <div
        className={cx("el-bg-pm")}
        style={{
          ...markerStyle,
        }}
      />
    </div>
  );
};
