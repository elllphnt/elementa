import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Rect, VectorData } from "@elllphnt/elementa-math-utils";
import cx from "classnames";
import { useCallback, useState } from "react";
import type { Subscription } from "rxjs";
import type { BoxResizeHandleType } from "~/_libs/interaction.js";
import { MouseInteraction } from "~/tools/interactions/mouse.js";

export function resolveResizeOrigin({
  startRect,
  symetrical,
  handle,
}: {
  startRect: Rect;
  symetrical: boolean;
  handle?: BoxResizeHandleType;
}) {
  if (symetrical || !handle) {
    return {
      x: startRect.x + startRect.width / 2,
      y: startRect.y + startRect.height / 2,
    };
  } else {
    switch (handle) {
      case "top": {
        return {
          x: startRect.x + startRect.width / 2,
          y: startRect.y + startRect.height,
        };
      }
      case "right": {
        return {
          x: startRect.x,
          y: startRect.y + startRect.height / 2,
        };
      }
      case "bottom": {
        return {
          x: startRect.x + startRect.width / 2,
          y: startRect.y,
        };
      }
      case "left": {
        return {
          x: startRect.x + startRect.width,
          y: startRect.y + startRect.height / 2,
        };
      }
      case "top-left": {
        return {
          x: startRect.x + startRect.width,
          y: startRect.y + startRect.height,
        };
      }
      case "top-right": {
        return {
          x: startRect.x,
          y: startRect.y + startRect.height,
        };
      }
      case "bottom-left": {
        return {
          x: startRect.x + startRect.width,
          y: startRect.y,
        };
      }
      case "bottom-right": {
        return {
          x: startRect.x,
          y: startRect.y,
        };
      }
    }
  }
}
export function resolveResizeScaleFactor({
  delta,
  handle,
  startRect,
  symetrical,
  proportional,
  axis,
}: {
  delta: VectorData;
  handle?: BoxResizeHandleType;
  startRect: Rect;
  symetrical: boolean;
  proportional: boolean;
  axis: { x: boolean; y: boolean };
}) {
  const viewportStartUnionRect = startRect;
  let dx: number | undefined = undefined;
  let dy: number | undefined = undefined;

  if (handle === "left" || handle === "top-left" || handle === "bottom-left") {
    dx = 0 - delta.x / viewportStartUnionRect.width;
  }
  if (
    handle === "right" ||
    handle === "top-right" ||
    handle === "bottom-right"
  ) {
    dx = 0 + delta.x / viewportStartUnionRect.width;
  }
  if (handle === "top" || handle === "top-left" || handle === "top-right") {
    dy = 0 - delta.y / viewportStartUnionRect.height;
  }
  if (
    handle === "bottom" ||
    handle === "bottom-left" ||
    handle === "bottom-right"
  ) {
    dy = 0 + delta.y / viewportStartUnionRect.height;
  }

  if (proportional) {
    if (dx === undefined) {
      dx = dy || 0;
    }
    if (dy === undefined) {
      dy = dx || 0;
    }
    dx = Math.min(dx, dy);
    dy = Math.min(dx, dy);
  }

  if (symetrical) {
    dx = (dx || 0) * 2;
    dy = (dy || 0) * 2;
  }

  if (!axis.x) {
    dx = undefined;
  }
  if (!axis.y) {
    dy = undefined;
  }

  return {
    x: 1 + (dx || 0),
    y: 1 + (dy || 0),
  };
}

export type OnResizeStart = (handle: BoxResizeHandleType) => void;
export type OnResizeUpdate = (_: {
  axis: { x: boolean; y: boolean };
  delta: { x: number; y: number };
  symetrical: boolean;
  proportional: boolean;
}) => void;
export type OnResizeEnd = () => void;

export function RawResizeHandle({
  onResizeEnd,
  onResizeStart,
  onResizeUpdate,
}: {
  onResizeStart?: OnResizeStart;
  onResizeUpdate?: OnResizeUpdate;
  onResizeEnd?: OnResizeEnd;
}) {
  const top = useState(true);
  const bottom = useState(true);
  const left = useState(true);
  const right = useState(true);
  const topLeft = useState(true);
  const topRight = useState(true);
  const bottomLeft = useState(true);
  const bottomRight = useState(true);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: BoxResizeHandleType) => {
      e.stopPropagation();
      e.preventDefault();

      const mouseInteraction = new MouseInteraction();
      const subscriptions: Subscription[] = [];

      mouseInteraction.on("start", () => {
        onResizeStart?.(handle);

        subscriptions.push(
          combineLatestOrEmpty([
            mouseInteraction.deltaPosition$,
            mouseInteraction.shiftKey$,
            mouseInteraction.altKey$,
            mouseInteraction.ctrlKey$,
          ]).subscribe(([delta, shiftKey, altKey]) => {
            const symetrical = altKey;
            const proportional = shiftKey;
            const axis = {
              x: false,
              y: false,
            };
            if (
              handle === "top" ||
              handle === "bottom" ||
              handle === "top-left" ||
              handle === "top-right" ||
              handle === "bottom-left" ||
              handle === "bottom-right" ||
              proportional
            ) {
              axis.y = true;
            }

            if (
              handle === "left" ||
              handle === "right" ||
              handle === "top-left" ||
              handle === "top-right" ||
              handle === "bottom-left" ||
              handle === "bottom-right" ||
              proportional
            ) {
              axis.x = true;
            }

            onResizeUpdate?.({
              axis,
              delta,
              symetrical,
              proportional,
            });
          })
        );
      });
      mouseInteraction.on("stop", () => {
        onResizeEnd?.();
        mouseInteraction.dispose();
        subscriptions.forEach((s) => s.unsubscribe());
      });

      mouseInteraction.run(window, { x: e.clientX, y: e.clientY });
    },
    []
  );

  return (
    <>
      {/* Edges */}
      {top && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-edge",
            "elementa-resize-handle-top"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "top")}
        />
      )}
      {bottom && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-edge",
            "elementa-resize-handle-bottom"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "bottom")}
        />
      )}
      {left && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-edge",
            "elementa-resize-handle-left"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "left")}
        />
      )}
      {right && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-edge",
            "elementa-resize-handle-right"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "right")}
        />
      )}
      {/* Corners */}
      {topLeft && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-corner",
            "elementa-resize-handle-top-left"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "top-left")}
        />
      )}
      {topRight && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-corner",
            "elementa-resize-handle-top-right"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "top-right")}
        />
      )}
      {bottomLeft && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-corner",
            "elementa-resize-handle-bottom-left"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "bottom-left")}
        />
      )}
      {bottomRight && (
        <div
          className={cx(
            "elementa-resize-handle",
            "elementa-resize-handle-corner",
            "elementa-resize-handle-bottom-right"
          )}
          draggable
          onDragStart={(e) => handleMouseDown(e, "bottom-right")}
        />
      )}
    </>
  );
}
