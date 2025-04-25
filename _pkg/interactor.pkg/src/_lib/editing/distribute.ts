import { Rect } from "@repo/utils";
import { IMovableHandle } from "~/src/_types/handles/properties/movable";
import { Handle, handleProperties } from "~/src/handles/_";

export function distributeHandles(renderables: Handle[], axis: "x" | "y") {
  if (renderables.length <= 2) return;

  const rects = renderables.map((r) => r.contentRect);
  const allrect = Rect.union(rects);

  const sortedRenderables = renderables.sort((a, b) => {
    const arect = a.contentRect;
    const brect = b.contentRect;

    switch (axis) {
      case "x":
        return arect.x - brect.x;
      case "y":
        return arect.y - brect.y;
    }
  });
  const totalSize = sortedRenderables.reduce((acc, r) => {
    const rect = r.contentRect;
    return acc + (axis === "x" ? rect.width : rect.height);
  }, 0);
  const space =
    axis === "x" ? allrect.width - totalSize : allrect.height - totalSize;

  let offset = 0;
  const interspace = space / (sortedRenderables.length - 1);

  for (let i = 0; i < sortedRenderables.length; i++) {
    const handle = sortedRenderables[i];
    const rect = handle.contentRect;
    if (!handle.property(handleProperties.isMovable)) {
      continue;
    }
    const movable = handle as unknown as IMovableHandle;

    if (axis === "x") {
      movable.setPosition({
        x: allrect.x + offset,
        y: rect.y,
      });
    } else {
      movable.setPosition({
        x: rect.x,
        y: allrect.y + offset,
      });
    }

    offset += (axis === "x" ? rect.width : rect.height) + interspace;
  }
}
