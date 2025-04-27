import { resolveContainingElement } from "~/src/_lib/css";
import { IEntityHandle } from "~/src/_types/_";

export function createDragImages(handle: IEntityHandle) {
  const images: HTMLElement[] = [];

  for (const key in handle.renderable.htmlElements) {
    const source = handle.renderable.htmlElements[key];
    const rect = handle.rects[key]?.contentRect;
    if (!rect || !source) continue;

    // containing block for the element if it was fixed.
    const containingElement = resolveContainingElement(source, "fixed");
    const containingRect =
      handle.interactor.stager.viewport.contentRect(containingElement);

    const top = rect.y - containingRect.y;
    const left = rect.x - containingRect.x;

    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transform = "translate(0, 0)";
    clone.style.top = `${top}px`;
    clone.style.left = `${left}px`;
    clone.style.zIndex = "1000000";
    source.parentElement?.appendChild(clone);

    images.push(clone);
  }

  return images;
}
