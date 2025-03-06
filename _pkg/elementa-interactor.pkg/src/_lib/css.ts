export const layoutProperties = new Set([
  "position",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-width",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "top",
  "right",
  "bottom",
  "left",
  "font-size",
  "line-height",
  "letter-spacing",
  "el-text-indent",
  "el-text-shadow",
  "column-gap",
  "column-rule-width",
  "column-width",
  "row-gap",
  "row-rule-width",
  "row-width",
  "gap",
  "display",
  "flex-direction",
  "flex-wrap",
  "justify-content",
  "align-items",
  "align-content",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "order",
  "grid-template-columns",
  "grid-template-rows",
  "grid-template-areas",
  "grid-template",
]);

export function resolveNearestPositionedParent(
  element: HTMLElement,
): HTMLElement | undefined {
  const parent = element.parentElement;
  if (!parent) {
    return undefined;
  }

  const computedStyle = getComputedStyle(parent);
  const position = computedStyle.getPropertyValue("position");
  if (position !== "static") {
    return parent;
  } else {
    return resolveNearestPositionedParent(parent);
  }
}

export function resolveContainingElement(
  element: HTMLElement,
  withPosition?: string,
): HTMLElement {
  const position = withPosition ?? getComputedStyle(element).position;

  function hasPosition(el: HTMLElement): boolean {
    const position = getComputedStyle(el).position;
    return (
      position === "relative" ||
      position === "absolute" ||
      position === "sticky" ||
      position === "fixed"
    );
  }

  function hasSpecialContainment(el: HTMLElement): boolean {
    const style = getComputedStyle(el);
    return (
      style.transform !== "none" ||
      style.perspective !== "none" ||
      style.willChange === "transform" ||
      style.willChange === "perspective" ||
      style.filter !== "none" ||
      style.willChange === "filter" ||
      style.contain === "layout" ||
      style.contain === "paint" ||
      style.contain === "strict" ||
      style.contain === "content" ||
      style.containerType !== "normal" ||
      style.backdropFilter !== "none"
    );
  }

  let candidate: HTMLElement | null = element.parentElement;

  while (candidate) {
    if (["static", "relative", "sticky"].includes(position)) {
      break;
    } else if (position === "absolute") {
      if (hasPosition(candidate)) {
        break;
      }
    } else if (position === "fixed") {
      if (hasSpecialContainment(candidate)) {
        break;
      }
    }

    candidate = candidate.parentElement;
  }

  return candidate || element.ownerDocument.documentElement;
}
