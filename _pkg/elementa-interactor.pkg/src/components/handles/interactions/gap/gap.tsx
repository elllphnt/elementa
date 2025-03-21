import { RectData, useObservable } from "@repo/utils";
import React, { useEffect, useRef } from "react";
import { Observable } from "rxjs";
import { ContainerElementHandle, ElementHandle } from "~/src/handles/_";
import { FlexGapHandle } from "./flex";

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
      />,
    );
  }

  return <>{handleElements}</>;
}

export function GapHandle({ handle }: { handle: ContainerElementHandle }) {
  const content = useObservable(handle.children$, handle.children);

  return (
    <FlexGapHandle container={handle} content={content as ElementHandle[]} />
  );
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
              Math.min(...a.map((r) => r.y)) - Math.min(...b.map((r) => r.y)),
          );
          for (let i = 0; i < sortedRows.length - 1; i++) {
            const currentRow = sortedRows[i];
            const nextRow = sortedRows[i + 1];
            const currentRowBottom = Math.max(
              ...currentRow.map((r) => r.y + r.height),
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
              Math.min(...a.map((r) => r.x)) - Math.min(...b.map((r) => r.x)),
          );
          for (let i = 0; i < sortedCols.length - 1; i++) {
            const currentCol = sortedCols[i];
            const nextCol = sortedCols[i + 1];
            const currentColRight = Math.max(
              ...currentCol.map((r) => r.x + r.width),
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
