import { Rect } from "@repo/utils";
import { IMovableHandle } from "~/src/_types/handles/properties/movable";
import { handleProperties } from "~/src/handles/_";
import { Handle } from "~/src/handles/handle";

export function alignHandles(
  handles: Handle[],
  align: "left" | "h-center" | "right" | "top" | "v-center" | "bottom",
) {
  const rects = handles.map((r) => r.contentRect);
  const allrect = Rect.union(rects);

  for (const handle of handles) {
    if (!handle.property(handleProperties.isMovable)) continue;
    const movable = handle as IMovableHandle;
    const thisrect = movable.contentRect;

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
