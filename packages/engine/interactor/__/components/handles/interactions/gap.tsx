import { constantOf } from "@elllphnt/elementa-base";
import type {
  RectData} from "@elllphnt/elementa-utils";
import {
  combineLatestOrEmpty,
  useObservable,
} from "@elllphnt/elementa-utils";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { Observable} from "rxjs";
import { of, switchMap } from "rxjs";
import { map } from "rxjs/operators";
import { lengthToPixels } from "~/_lib/utils";
import type { ContainerElementHandle, ElementHandle } from "~/handles/_";
import { useElementaInteractor } from "../../../hooks/elementa_interactor.js";
import { MouseInteraction } from "../../../tools/interactions/mouse.js";

function __GapHandle({ handle }: { handle: ContainerElementHandle }) {
  const children = useObservable(handle.children$, handle.children);

  return (
    <GapHandleContent handle={handle} children={children as ElementHandle[]} />
  );
}

function GapHandleContent({
  handle,
  children,
}: {
  handle: ElementHandle;
  children: ElementHandle[];
}) {
  const handleElements: React.ReactNode[] = [];

  for (let i = 0; i < children.length - 1; i++) {
    const before = children[i];
    const after = children[i + 1];
    handleElements.push(
      <GapHandleHandle
        key={`${before.key}:${after.key}`}
        handle={handle}
        before={before}
        after={after}
      />
    );
  }

  return <>{handleElements}</>;
}

function GapHandleHandle({
  handle,
  before,
  after,
}: {
  handle: ElementHandle;
  before: ElementHandle;
  after: ElementHandle;
}) {
  const editor = useElementaInteractor();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shapeSubscription = combineLatestOrEmpty([
      handle.interfaceRect$,
      handle.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("display"))
      ),
      handle.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("flex-direction"))
      ),
      before.interfaceRect$,
      after.interfaceRect$,
      before.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("position"))
      ),
      after.style$.pipe(
        switchMap((style) => style.resolvedPropertyValue$("position"))
      ),
      editor.stager.viewport.scale$,
      combineLatestOrEmpty([
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-left"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-right"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-bottom"))
        ),
        handle.style$.pipe(
          switchMap((style) => style.resolvedPropertyValue$("padding-left"))
        ),
      ]),
    ]).subscribe(
      ([
        instanceRect,
        layout,
        direction,
        beforeRect,
        afterRect,
        beforePosition,
        afterPosition,
        scale,
        paddings,
      ]) => {
        const padding = {
          top: paddings[0] ?? {
            value: 0,
            unit: "px",
          },
          right: paddings[1] ?? {
            value: 0,
            unit: "px",
          },
          bottom: paddings[2] ?? {
            value: 0,
            unit: "px",
          },
          left: paddings[3] ?? {
            value: 0,
            unit: "px",
          },
        };

        if (!instanceRect) {
          return;
        }

        const container = containerRef.current;
        const _handle = handleRef.current;

        if (!container || !_handle || !beforeRect || !afterRect) {
          return;
        }

        if (
          [beforePosition, afterPosition].some(
            (position) => position === "absolute" || position === "fixed"
          )
        ) {
          container?.style.setProperty("display", "none");
        } else {
          container?.style.removeProperty("display");
        }

        let top = 0,
          left = 0,
          right = 0,
          bottom = 0;
        let cursor = "ns-resize";
        let rotate = "rotate(0deg)";

        if (!direction || direction === "row") {
          top = lengthToPixels(padding.top, "y") * scale;
          bottom = lengthToPixels(padding.bottom, "y") * scale;
          left = beforeRect.x + beforeRect.width - instanceRect.x;
          right = instanceRect.x + instanceRect.width - afterRect.x;
          cursor = "ew-resize";
          rotate = "rotate(90deg)";
        } else {
          left = lengthToPixels(padding.left, "x") * scale;
          right = lengthToPixels(padding.right, "x") * scale;
          top = beforeRect.y + beforeRect.height - instanceRect.y;
          bottom = instanceRect.y + instanceRect.height - afterRect.y;
          cursor = "ns-resize";
          rotate = "rotate(0deg)";
        }

        container.style.setProperty("top", `${top}px`);
        container.style.setProperty("left", `${left}px`);
        container.style.setProperty("right", `${right}px`);
        container.style.setProperty("bottom", `${bottom}px`);
        _handle.style.setProperty(
          "--elementa-gap-handle-handle-cursor",
          cursor
        );
        _handle.style.setProperty(
          "--elementa-gap-handle-handle-rotate",
          rotate
        );
      }
    );
    return () => shapeSubscription.unsubscribe();
  }, [editor, before, after]);

  const handleGapStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = before.interfaceRect;
    if (!rect) return;

    const mouseInteraction = new MouseInteraction();
    mouseInteraction.on("start", (e) => {
      editor.setFlag("gapping", true);

      const style = handle.style;
      const initialGap = {
        x: handle.style.resolvedPropertyValue("gap-x") ?? {
          value: 0,
          unit: "px",
        },
        y: handle.style.resolvedPropertyValue("gap-x") ?? {
          value: 0,
          unit: "px",
        },
      };
      const direction =
        constantOf(style.resolvedPropertyValue("flex-direction") as any) ??
        "row";

      const deltaSubscription = combineLatestOrEmpty([
        mouseInteraction.deltaPosition$,
        mouseInteraction.ctrlKey$,
        mouseInteraction.altKey$,
      ]).subscribe(([delta, individual, symetrical]) => {
        let deltaGapValue = 0;

        if (direction === "row") {
          deltaGapValue = delta.x / editor.stager.viewport.scale;
        } else {
          deltaGapValue = delta.y / editor.stager.viewport.scale;
        }

        const newGap = {
          x: _.clamp(
            lengthToPixels(initialGap.x, "x") + deltaGapValue,
            0,
            Number.MAX_SAFE_INTEGER
          ),
          y: _.clamp(
            lengthToPixels(initialGap.y, "y") + deltaGapValue,
            0,
            Number.MAX_SAFE_INTEGER
          ),
        };

        // rounded
        style.setProperty("gap-x", {
          value: Math.round(newGap.x ?? 0),
          unit: "px",
        });
        style.setProperty("gap-y", {
          value: Math.round(newGap.y ?? 0),
          unit: "px",
        });
      });

      mouseInteraction.on("stop", () => {
        deltaSubscription.unsubscribe();
        mouseInteraction.dispose();

        setTimeout(() => {
          editor.setFlag("gapping", false);
        }, 0);
      });
    });

    mouseInteraction.run(window, {
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="elementa-gap-handle"
      style={{
        pointerEvents: "none",
      }}
    >
      <div
        ref={handleRef}
        className="elementa-gap-handle-handle"
        draggable
        onDragStart={handleGapStart}
        style={{
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}

export function GapHandle({ handle }: { handle: ContainerElementHandle }) {
  const aggregatedProps$ = useMemo(() => {
    return combineLatestOrEmpty([
      handle.interfaceRect$.pipe(
        map((r) => r?.data ?? { x: 0, y: 0, width: 0, height: 0 })
      ),
      handle.children$,
      handle.style$,
    ]).pipe(
      switchMap(([containerRect, children, style]) => {
        const childrenObservables = children.map((child) =>
          child.interfaceRect$.pipe(
            map((r) => r?.data ?? { x: 0, y: 0, width: 0, height: 0 })
          )
        );
        return childrenObservables.length
          ? combineLatestOrEmpty(childrenObservables).pipe(
              map((contentRects) => ({
                containerRect,
                contentRects,
                flow: "row" as const,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
              }))
            )
          : of({
              containerRect,
              contentRects: [],
              flow: "row" as const,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
            });
      })
    );
  }, [handle]);

  return <_GapHandle props$={aggregatedProps$} />;
}

interface Handle {
  x: number;
  y: number;
  orientation: "vertical" | "horizontal";
}

// Helper function to group rects into rows based on y coordinate (with a tolerance)
function groupByRow(rects: RectData[]): RectData[][] {
  const sorted = [...rects].sort((a, b) => a.y - b.y);
  const rows: RectData[][] = [];
  const threshold = 5; // tolerance in pixels for grouping
  sorted.forEach((rect) => {
    let found = false;
    for (const row of rows) {
      if (Math.abs(row[0].y - rect.y) < threshold) {
        row.push(rect);
        found = true;
        break;
      }
    }
    if (!found) {
      rows.push([rect]);
    }
  });
  return rows;
}

// Helper function to group rects into columns based on x coordinate (with a tolerance)
function groupByColumn(rects: RectData[]): RectData[][] {
  const sorted = [...rects].sort((a, b) => a.x - b.x);
  const columns: RectData[][] = [];
  const threshold = 5; // tolerance in pixels for grouping
  sorted.forEach((rect) => {
    let found = false;
    for (const col of columns) {
      if (Math.abs(col[0].x - rect.x) < threshold) {
        col.push(rect);
        found = true;
        break;
      }
    }
    if (!found) {
      columns.push([rect]);
    }
  });
  return columns;
}

export function _GapHandle({
  props$,
}: {
  props$: Observable<{
    contentRects: RectData[];
    containerRect: RectData;
    flow: "row" | "column";
    padding: { top: number; right: number; bottom: number; left: number };
  }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subscription = props$.subscribe((props) => {
      const { contentRects, containerRect, flow } = props;
      const handles: Handle[] = [];
      const containerX = containerRect.x;
      const containerY = containerRect.y;

      if (flow === "row") {
        // Group children into rows.
        const rows = groupByRow(contentRects);
        // Insert handles between adjacent elements in each row.
        rows.forEach((row) => {
          const sortedRow = row.sort((a, b) => a.x - b.x);
          const rowTop = Math.min(...sortedRow.map((r) => r.y));
          const rowBottom = Math.max(...sortedRow.map((r) => r.y + r.height));
          const rowCenter = (rowTop + rowBottom) / 2;
          for (let i = 0; i < sortedRow.length - 1; i++) {
            const current = sortedRow[i];
            const next = sortedRow[i + 1];
            const gapX = (current.x + current.width + next.x) / 2;
            handles.push({
              x: gapX - containerX,
              y: rowCenter - containerY,
              orientation: "vertical",
            });
          }
        });
        // Insert a handle between rows if there's more than one.
        if (rows.length > 1) {
          const sortedRows = rows.sort(
            (a, b) =>
              Math.min(...a.map((r) => r.y)) - Math.min(...b.map((r) => r.y))
          );
          for (let i = 0; i < sortedRows.length - 1; i++) {
            const currentRow = sortedRows[i];
            const nextRow = sortedRows[i + 1];
            const currentRowBottom = Math.max(
              ...currentRow.map((r) => r.y + r.height)
            );
            const nextRowTop = Math.min(...nextRow.map((r) => r.y));
            const gapY = (currentRowBottom + nextRowTop) / 2;
            // Center horizontally in the container.
            const gapX = containerRect.x + containerRect.width / 2;
            handles.push({
              x: gapX - containerX,
              y: gapY - containerY,
              orientation: "horizontal",
            });
          }
        }
      } else if (flow === "column") {
        // Group children into columns.
        const columns = groupByColumn(contentRects);
        // Insert handles between adjacent elements in each column.
        columns.forEach((column) => {
          const sortedCol = column.sort((a, b) => a.y - b.y);
          const colLeft = Math.min(...sortedCol.map((r) => r.x));
          const colRight = Math.max(...sortedCol.map((r) => r.x + r.width));
          const colCenter = (colLeft + colRight) / 2;
          for (let i = 0; i < sortedCol.length - 1; i++) {
            const current = sortedCol[i];
            const next = sortedCol[i + 1];
            const gapY = (current.y + current.height + next.y) / 2;
            handles.push({
              x: colCenter - containerX,
              y: gapY - containerY,
              orientation: "horizontal",
            });
          }
        });
        // Insert a handle between columns if there's more than one.
        if (columns.length > 1) {
          const sortedCols = columns.sort(
            (a, b) =>
              Math.min(...a.map((r) => r.x)) - Math.min(...b.map((r) => r.x))
          );
          for (let i = 0; i < sortedCols.length - 1; i++) {
            const currentCol = sortedCols[i];
            const nextCol = sortedCols[i + 1];
            const currentColRight = Math.max(
              ...currentCol.map((r) => r.x + r.width)
            );
            const nextColLeft = Math.min(...nextCol.map((r) => r.x));
            const gapX = (currentColRight + nextColLeft) / 2;
            // Center vertically in the container.
            const gapY = containerRect.y + containerRect.height / 2;
            handles.push({
              x: gapX - containerX,
              y: gapY - containerY,
              orientation: "vertical",
            });
          }
        }
      }

      // Direct DOM update: set container dimensions and update handles.
      if (containerRef.current) {
        containerRef.current.style.width = `${containerRect.width}px`;
        containerRef.current.style.height = `${containerRect.height}px`;
        // Clear previous handles.
        containerRef.current.innerHTML = "";
        // Create and append new handle elements.
        handles.forEach((handle) => {
          const handleDiv = document.createElement("div");
          handleDiv.style.position = "absolute";
          handleDiv.style.left = `${handle.x - 4}px`; // Center the 8px handle.
          handleDiv.style.top = `${handle.y - 4}px`;
          handleDiv.style.width = "8px";
          handleDiv.style.height = "8px";
          handleDiv.style.borderRadius = "50%";
          handleDiv.style.backgroundColor = "blue";
          handleDiv.className = `gap-handle ${handle.orientation}`;
          containerRef.current?.appendChild(handleDiv);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [props$]);

  // The container div that hosts our directly managed handles.
  return <div ref={containerRef} style={{ position: "relative" }} />;
}
