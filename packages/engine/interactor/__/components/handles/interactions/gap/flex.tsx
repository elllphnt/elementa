import { combineLatestOrEmpty, RectData } from "@elllphnt/elementa-utils";
import { ReactNode, useEffect, useRef } from "react";
import { combineLatest, map, switchMap } from "rxjs";
import { ElementHandle } from "~/handles/_";
import { GapHandleHandle } from "./handle.js";

type Direction = "row" | "column";
type Alignment = "start" | "center" | "end" | "stretch";

/**
 * Groups rectangles into rows based on a vertical coordinate.
 * The coordinate is determined by the alignment:
 * - "start" or "stretch": use rect.y (top)
 * - "center": use rect.y + rect.height/2 (center)
 * - "end": use rect.y + rect.height (bottom)
 */
function groupByRow(
  rects: RectData[],
  tolerance = 5,
  alignment: Alignment
): RectData[][] {
  const getRowCoord = (rect: RectData) => {
    switch (alignment) {
      case "center":
        return rect.y + rect.height / 2;
      case "end":
        return rect.y + rect.height;
      case "start":
      case "stretch":
      default:
        return rect.y;
    }
  };

  const sorted = [...rects].sort((a, b) => getRowCoord(a) - getRowCoord(b));
  const rows: RectData[][] = [];
  sorted.forEach((rect) => {
    const coord = getRowCoord(rect);
    const existingRow = rows.find(
      (r) => Math.abs(getRowCoord(r[0]) - coord) < tolerance
    );
    if (existingRow) {
      existingRow.push(rect);
    } else {
      rows.push([rect]);
    }
  });
  return rows;
}

/**
 * Groups rectangles into columns based on a horizontal coordinate.
 * The coordinate is determined by the alignment:
 * - "start" or "stretch": use rect.x (left)
 * - "center": use rect.x + rect.width/2 (center)
 * - "end": use rect.x + rect.width (right)
 */
function groupByColumn(
  rects: RectData[],
  tolerance = 5,
  alignment: Alignment
): RectData[][] {
  const getColCoord = (rect: RectData) => {
    switch (alignment) {
      case "center":
        return rect.x + rect.width / 2;
      case "end":
        return rect.x + rect.width;
      case "start":
      case "stretch":
      default:
        return rect.x;
    }
  };

  const sorted = [...rects].sort((a, b) => getColCoord(a) - getColCoord(b));
  const columns: RectData[][] = [];
  sorted.forEach((rect) => {
    const coord = getColCoord(rect);
    const existingCol = columns.find(
      (c) => Math.abs(getColCoord(c[0]) - coord) < tolerance
    );
    if (existingCol) {
      existingCol.push(rect);
    } else {
      columns.push([rect]);
    }
  });
  return columns;
}

/**
 * Updates the positions and sizes of pre-created handle elements so that each
 * handle fills the gap between children.
 *
 * For flex-wrap containers, there are two types of gaps:
 *  - Internal gaps between adjacent items in the same row/column.
 *  - Inter-group gaps between rows/columns.
 *
 * The total handles count will always be n - 1 (n is the number of children).
 *
 * Additionally, each handle element gets a data attribute (data-gap-direction)
 * set to "vertical" or "horizontal" based on the gap's orientation.
 */
export function updateHandlePositions({
  handles,
  direction,
  alignment,
  containerRect,
  contentRects,
}: {
  handles: (HTMLElement | undefined)[];
  direction: Direction;
  alignment: Alignment;
  containerRect: RectData;
  contentRects: RectData[];
}) {
  let handleIndex = 0;

  if (direction === "row") {
    // Group the children into rows based on the chosen vertical coordinate.
    const rows = groupByRow(contentRects, 5, alignment);
    // Sort rows by their computed coordinate.
    rows.sort((a, b) => {
      const getRowCoord = (rect: RectData) =>
        alignment === "center"
          ? rect.y + rect.height / 2
          : alignment === "end"
          ? rect.y + rect.height
          : rect.y;
      return getRowCoord(a[0]) - getRowCoord(b[0]);
    });

    // 1. Internal gaps within each row.
    rows.forEach((row) => {
      row.sort((a, b) => a.x - b.x);
      for (let i = 0; i < row.length - 1; i++) {
        const childA = row[i];
        const childB = row[i + 1];
        // Horizontal gap: from right edge of childA to left edge of childB.
        const gapLeft = childA.x + childA.width - containerRect.x;
        const gapWidth = childB.x - (childA.x + childA.width);
        // Vertical gap: union of the vertical extents of both children.
        const effectiveTop = Math.min(childA.y, childB.y) - containerRect.y;
        const effectiveBottom =
          Math.max(childA.y + childA.height, childB.y + childB.height) -
          containerRect.y;
        const gapTop = effectiveTop;
        const gapHeight = effectiveBottom - effectiveTop;

        if (handles[handleIndex]) {
          handles[handleIndex]!.style.position = "absolute";
          handles[handleIndex]!.style.left = `${gapLeft}px`;
          handles[handleIndex]!.style.top = `${gapTop}px`;
          handles[handleIndex]!.style.width = `${gapWidth}px`;
          handles[handleIndex]!.style.height = `${gapHeight}px`;
          // In row flex, internal gaps are vertical.
          handles[handleIndex]!.dataset.gapDirection = "vertical";
        }
        handleIndex++;
      }
    });

    // 2. Inter-row gaps.
    if (rows.length > 1) {
      for (let i = 0; i < rows.length - 1; i++) {
        const rowA = rows[i];
        const rowB = rows[i + 1];
        // Vertical gap: from the bottom of rowA to the top of rowB.
        const rowABottom =
          Math.max(...rowA.map((r) => r.y + r.height)) - containerRect.y;
        const rowBTop = Math.min(...rowB.map((r) => r.y)) - containerRect.y;
        const gapTop = rowABottom;
        const gapHeight = rowBTop - rowABottom;
        // For inter-row gap, fill the full container width.
        const gapLeft = 0;
        const gapWidth = containerRect.width;

        if (handles[handleIndex]) {
          handles[handleIndex]!.style.position = "absolute";
          handles[handleIndex]!.style.left = `${gapLeft}px`;
          handles[handleIndex]!.style.top = `${gapTop}px`;
          handles[handleIndex]!.style.width = `${gapWidth}px`;
          handles[handleIndex]!.style.height = `${gapHeight}px`;
          // Between rows, the gap is horizontal.
          handles[handleIndex]!.dataset.gapDirection = "horizontal";
        }
        handleIndex++;
      }
    }
  } else if (direction === "column") {
    // Group the children into columns based on the chosen horizontal coordinate.
    const columns = groupByColumn(contentRects, 5, alignment);
    // Sort columns by their computed coordinate.
    columns.sort((a, b) => {
      const getColCoord = (rect: RectData) =>
        alignment === "center"
          ? rect.x + rect.width / 2
          : alignment === "end"
          ? rect.x + rect.width
          : rect.x;
      return getColCoord(a[0]) - getColCoord(b[0]);
    });

    // 1. Internal gaps within each column.
    columns.forEach((col) => {
      col.sort((a, b) => a.y - b.y);
      for (let i = 0; i < col.length - 1; i++) {
        const childA = col[i];
        const childB = col[i + 1];
        // Vertical gap: from bottom edge of childA to top edge of childB.
        const gapTop = childA.y + childA.height - containerRect.y;
        const gapHeight = childB.y - (childA.y + childA.height);
        // Horizontal gap: union of the horizontal extents.
        const effectiveLeft = Math.min(childA.x, childB.x) - containerRect.x;
        const effectiveRight =
          Math.max(childA.x + childA.width, childB.x + childB.width) -
          containerRect.x;
        const gapLeft = effectiveLeft;
        const gapWidth = effectiveRight - effectiveLeft;

        if (handles[handleIndex]) {
          handles[handleIndex]!.style.position = "absolute";
          handles[handleIndex]!.style.left = `${gapLeft}px`;
          handles[handleIndex]!.style.top = `${gapTop}px`;
          handles[handleIndex]!.style.width = `${gapWidth}px`;
          handles[handleIndex]!.style.height = `${gapHeight}px`;
          // In column flex, internal gaps are horizontal.
          handles[handleIndex]!.dataset.gapDirection = "horizontal";
        }
        handleIndex++;
      }
    });

    // 2. Inter-column gaps.
    if (columns.length > 1) {
      for (let i = 0; i < columns.length - 1; i++) {
        const colA = columns[i];
        const colB = columns[i + 1];
        // Horizontal gap: from the right of colA to the left of colB.
        const colARight =
          Math.max(...colA.map((r) => r.x + r.width)) - containerRect.x;
        const colBLeft = Math.min(...colB.map((r) => r.x)) - containerRect.x;
        const gapLeft = colARight;
        const gapWidth = colBLeft - colARight;
        // For inter-column gap, fill the full container height.
        const gapTop = 0;
        const gapHeight = containerRect.height;

        if (handles[handleIndex]) {
          handles[handleIndex]!.style.position = "absolute";
          handles[handleIndex]!.style.left = `${gapLeft}px`;
          handles[handleIndex]!.style.top = `${gapTop}px`;
          handles[handleIndex]!.style.width = `${gapWidth}px`;
          handles[handleIndex]!.style.height = `${gapHeight}px`;
          // Between columns, the gap is vertical.
          handles[handleIndex]!.dataset.gapDirection = "vertical";
        }
        handleIndex++;
      }
    }
  }
}

export function FlexGapHandle({
  container,
  content,
}: {
  container: ElementHandle;
  content: ElementHandle[];
}) {
  const handlesRef = useRef<(HTMLDivElement | undefined)[]>([]);
  const handles: ReactNode[] = [];

  useEffect(() => {
    const subscription = combineLatest([
      container.style$.pipe(
        switchMap((style) =>
          combineLatest([
            style
              .resolvedPropertyValue$("flex-direction")
              .pipe(
                map((value) =>
                  value === "unset" || value == undefined ? "row" : value
                )
              ),
            style
              .resolvedPropertyValue$("align-items")
              .pipe(
                map((value) =>
                  value === "unset" || value == undefined ? "stretch" : value
                )
              ),
          ])
        )
      ),
      container.interfaceRect$.pipe(
        map((rect) => rect?.data ?? { x: 0, y: 0, width: 0, height: 0 })
      ),
      combineLatestOrEmpty(
        content.map((child) =>
          child.interfaceRect$.pipe(
            map((rect) => rect?.data ?? { x: 0, y: 0, width: 0, height: 0 })
          )
        )
      ),
    ]).subscribe(([[direction, alignment], containerRect, contentRects]) => {
      updateHandlePositions({
        handles: handlesRef.current,
        direction,
        alignment,
        containerRect,
        contentRects,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [container, content.map((c) => c.key).join(",")]);

  for (let i = 0; i < content.length - 1; i++) {
    handles.push(
      <GapHandleHandle
        key={i}
        ref={(el) =>
          (handlesRef.current[i] = (el as HTMLDivElement) || undefined)
        }
        element={container}
      />
    );
  }

  return <>{handles}</>;
}
