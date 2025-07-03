import { Rect } from "@elllphnt/elementa-math-utils";
import { Handle } from "~/handles/handle";

export function alignHandles(
  handles: Handle[],
  align: "left" | "h-center" | "right" | "top" | "v-center" | "bottom"
) {
  const rects = handles.map((r) => r.contentRect);
  const allrect = Rect.union(rects);

  for (const handle of handles) {
    if (!handle.property(handleProperties.isMovable)) continue;
    const movable = handle as unknown as IMovableHandle;
    const thisrect = movable.contentRect || Rect.nullRect();

    switch (align) {
      case "left":
        movable.setPosition({
          x: allrect.x,
          y: thisrect.y,
        });
        break;
      case "h-center":
        movable.setPosition({
          x: allrect.x + allrect.width / 2 - thisrect.width / 2,
          y: thisrect.y,
        });
        break;
      case "right":
        movable.setPosition({
          x: allrect.x + allrect.width - thisrect.width,
          y: thisrect.y,
        });
        break;
      case "top":
        movable.setPosition({
          x: thisrect.x,
          y: allrect.y,
        });
        break;
      case "v-center":
        movable.setPosition({
          x: thisrect.x,
          y: allrect.y + allrect.height / 2 - thisrect.height / 2,
        });
        break;
      case "bottom":
        movable.setPosition({
          x: thisrect.x,
          y: allrect.y + allrect.height - thisrect.height,
        });
        break;
    }
  }
}
