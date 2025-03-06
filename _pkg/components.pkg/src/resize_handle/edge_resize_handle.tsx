import cx from "classnames";
import { CSSProperties, useRef, useState } from "react";

export type EdgeResizeHandleProps = JSX.IntrinsicElements["div"] & {
  edge: "top" | "bottom" | "left" | "right";
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
};

export const EdgeResizeHandle: React.FC<EdgeResizeHandleProps> = ({
  weight = 4,
  markerWeight = 2,
  offset = 0,
  edge,
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

  let handleStyle: CSSProperties = {};
  let markerStyle: CSSProperties = {};

  switch (edge) {
    case "top":
      handleStyle = {
        left: 0,
        right: 0,
        height: weight,
        top: offset,
        cursor: "ns-resize",
        transform: `translateY(-50%)`,
      };
      markerStyle = {
        left: 0,
        right: 0,
        height: markerWeight,
        top: "50%",
        transform: `translateY(-50%)`,
      };
      break;
    case "bottom":
      handleStyle = {
        left: 0,
        right: 0,
        height: weight,
        bottom: offset,
        cursor: "ns-resize",
        transform: `translateY(50%)`,
      };
      markerStyle = {
        left: 0,
        right: 0,
        height: markerWeight,
        top: "50%",
        transform: `translateY(-50%)`,
      };
      break;
    case "left":
      handleStyle = {
        top: 0,
        bottom: 0,
        width: weight,
        left: offset,
        cursor: "ew-resize",
        transform: `translateX(-50%)`,
      };
      markerStyle = {
        top: 0,
        bottom: 0,
        width: markerWeight,
        left: "50%",
        transform: `translateX(-50%)`,
      };
      break;
    case "right":
      handleStyle = {
        top: 0,
        bottom: 0,
        width: weight,
        right: offset,
        cursor: "ew-resize",
        transform: `translateX(50%)`,
      };
      markerStyle = {
        top: 0,
        bottom: 0,
        width: markerWeight,
        left: "50%",
        transform: `translateX(-50%)`,
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

    const start = edge === "top" || edge === "bottom" ? e.clientY : e.clientX;
    callbacks.current.onResizeStart?.(e);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const current =
        edge === "top" || edge === "bottom" ? e.clientY : e.clientX;

      switch (edge) {
        case "top":
          callbacks.current.onResizeUpdate?.(
            -(current - start),
            -e.movementY,
            e,
          );
          break;
        case "bottom":
          callbacks.current.onResizeUpdate?.(current - start, e.movementY, e);
          break;
        case "left":
          callbacks.current.onResizeUpdate?.(
            -(current - start),
            -e.movementX,
            e,
          );
          break;
        case "right":
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
    setHover(true);
  };
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    setHover(false);
  };

  return (
    <div
      className={cx("el-transition-opacity", {
        "el-opacity-1": active !== undefined ? active : isDragging || hover,
        "el-opacity-0": active !== undefined ? !active : !isDragging && !hover,
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
        className={cx("el-absolute el-bg-pm")}
        style={{
          ...markerStyle,
        }}
      />
    </div>
  );
};
