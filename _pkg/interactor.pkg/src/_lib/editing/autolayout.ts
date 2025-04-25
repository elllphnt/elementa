import { StyleData } from "@elllphnt/elll-element";
import { Rect } from "@repo/utils";
import _ from "lodash";
import { Handle } from "~/src/handles/handle";

export function generateFlexAutoLayout<I extends Handle>(
  renderables: I[],
  mainAxis: "x" | "y",
  crossAxisAlignment: "start" | "center" | "end",
): [StyleData, I[]] {
  const rects = renderables.map((r) => r.contentRect);
  const allrect = Rect.union(rects);

  const sortedRenderables = renderables.sort((a, b) => {
    const arect = a.contentRect;
    const brect = b.contentRect;

    switch (mainAxis) {
      case "x":
        return arect.x - brect.x;
      case "y":
        return arect.y - brect.y;
    }
  });
  const totalSize = sortedRenderables.reduce((acc, r) => {
    const rect = r.contentRect;
    return acc + (mainAxis === "x" ? rect.width : rect.height);
  }, 0);
  const space =
    mainAxis === "x" ? allrect.width - totalSize : allrect.height - totalSize;
  const gap = Math.max(0, space / (sortedRenderables.length - 1));

  const style: StyleData = {
    "display": "flex",
    "flex-direction": mainAxis === "x" ? "row" : "column",
    "align-items": crossAxisAlignment,
    "justify-content": "center",
    "gap-x":
      mainAxis === "x"
        ? {
            value: gap,
            unit: "px",
          }
        : {
            value: 0,
            unit: "px",
          },
    "gap-y":
      mainAxis === "y"
        ? {
            value: gap,
            unit: "px",
          }
        : {
            value: 0,
            unit: "px",
          },
  };

  return [style, sortedRenderables];
}

/**
 * Takes a list of renderables and automatically lays them out in a parent container.
 * Returns the style data that should be applied to the parent container and the ordered list of renderables.
 */
export function generateAutolayout<I extends Handle>(
  renderables: I[],
): [StyleData, I[]] | undefined {
  const rects = renderables.map((r) => r.contentRect);
  const centers = rects.map((r) => r.center);

  const totalRect = Rect.union(rects);
  const totalCenter = totalRect.center;

  const xSize = rects.reduce((acc, r) => acc + r.width, 0);
  const ySize = rects.reduce((acc, r) => acc + r.height, 0);

  const xFreeSpaceRatio = (totalRect.width - xSize) / totalRect.width;
  const yFreeSpaceRatio = (totalRect.height - ySize) / totalRect.height;

  const isColumn = xFreeSpaceRatio < yFreeSpaceRatio;
  const isRow = !isColumn;

  const totalCrossStart = isColumn ? totalRect.x : totalRect.y;
  const totalCrossEnd = isColumn
    ? totalRect.x + totalRect.width
    : totalRect.y + totalRect.height;

  const crossStarts = rects.map((r) => (isColumn ? r.x : r.y));
  const crossEnds = rects.map((r) =>
    isColumn ? r.x + r.width : r.y + r.height,
  );

  const crossCenterDeviation = _.mean(
    centers.map((c) =>
      Math.abs(isColumn ? c.x - totalCenter.x : c.y - totalCenter.y),
    ),
  );
  const crossStartDeviation = _.mean(
    crossStarts.map((s) => Math.abs(s - totalCrossStart)),
  );
  const crossEndDeviation = _.mean(
    crossEnds.map((e) => Math.abs(e - totalCrossEnd)),
  );

  const isStartAligned =
    crossStartDeviation < crossCenterDeviation &&
    crossStartDeviation < crossEndDeviation;
  const isEndAligned =
    crossEndDeviation < crossCenterDeviation &&
    crossEndDeviation < crossStartDeviation;

  const crossAlignment = isStartAligned
    ? "start"
    : isEndAligned
      ? "end"
      : "center";
  const axis = isColumn ? "y" : "x";

  return generateFlexAutoLayout(renderables, axis, crossAlignment);
}
