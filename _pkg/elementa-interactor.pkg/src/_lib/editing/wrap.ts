import { StylePropertyName } from "@elllphnt/elll-element";
import { ContainerElement } from "@repo/elementa-models";
import { Rect } from "@repo/utils";
import { ElementHandle } from "~/src/handles/_";
import { generateAutolayout } from "./autolayout";

function wrapElementsWithStrategy(
  elements: ElementHandle[],
  stategy: "absolute" | "static",
) {
  if (elements.length === 0) {
    return undefined;
  }
  const component = elements[0].entity.component;
  const rects = elements.map((e) => e.contentRect);
  const totalRect = Rect.union(rects);
  // get container
  const containerInstance = elements[0].parent;
  const containerRect = containerInstance?.contentRect;
  if (!containerInstance || !containerRect) {
    return undefined;
  }
  // resolve destination index
  const containerChildren = containerInstance.children;
  const indexes = elements
    .map((e) => containerChildren.indexOf(e))
    .filter((i) => i >= 0); // make we only get the indexes that are actually in the container
  const destinationIndex = Math.min(...indexes);
  // generate layout
  const autolayout = generateAutolayout(elements);
  const wrapperStyleData = autolayout?.[0] ?? {
    "display": "flex",
    "align-items": "center",
    "justify-content": "center",
  };
  const orderedElements = autolayout?.[1] ?? elements;
  // create wrapper
  const wrapper = new ContainerElement({
    component,
  });
  const baseWrapperStyle = wrapper.stylesheet.baseStyle(true);
  for (const key in wrapperStyleData) {
    baseWrapperStyle.setProperty(
      key as StylePropertyName,
      wrapperStyleData[key as StylePropertyName],
    );
  }
  if (stategy === "absolute") {
    baseWrapperStyle.setProperty("position", "absolute");
    baseWrapperStyle.setProperty("top", {
      value: totalRect.y - containerRect.y,
      unit: "px",
    });
    baseWrapperStyle.setProperty("left", {
      value: totalRect.x - containerRect.x,
      unit: "px",
    });
  } else {
    baseWrapperStyle.setProperty("position", "relative");
  }
  // make all elements static
  for (const element of orderedElements) {
    element.setPositionStrategy("static");
  }
  // add elements
  orderedElements.forEach((e) => e.entity.remove());
  wrapper.appendElements(...orderedElements.map((e) => e.entity));
  // add wrapper to container
  return containerInstance.handleEntityDrop([wrapper], {
    index: destinationIndex,
  });
}

export function wrapElements(elements: ElementHandle[]) {
  if (elements.length === 0) return;

  if (elements.every((e) => e.movable)) {
    return wrapElementsWithStrategy(elements, "absolute");
  } else {
    return wrapElementsWithStrategy(elements, "static");
  }
}
