import { Rect } from "@repo/utils";
import { ContainerElementHandle, ElementHandle } from "~/src/handles/_";

function unwrapContainer(containerInstance: ContainerElementHandle) {
  // get grand container
  const grandContainerHandle = containerInstance.parent;
  if (!grandContainerHandle) {
    return undefined;
  }
  // get children
  const children = containerInstance.children;
  if (children.length === 0) {
    return [containerInstance];
  }
  // resolve destination index
  const grandContainerChildren = grandContainerHandle.children;
  const destinationIndex = grandContainerChildren.indexOf(containerInstance);
  if (destinationIndex === -1) {
    throw new Error("Container not found in grand container");
  }
  // resolve positioning strategy
  const containerPosition =
    containerInstance.instance.style.resolvedPropertyValue("position");
  // release children
  if (["absolute", "relative", "fixed"].includes(containerPosition as any)) {
    for (const element of children) {
      const elementRect = element.contentRect ?? new Rect();
      element.setPositionStrategy(containerPosition as any);
      element.setPosition(elementRect.topLeft);
    }
  } else {
    for (const element of children) {
      element.setPositionStrategy("static");
    }
  }
  children.forEach((e) => e.entity.remove());
  // remove container from grand container
  containerInstance.entity.remove();
  // add children to grand container
  return grandContainerHandle.handleEntityDrop(
    children.map((e) => e.entity),
    {
      index: destinationIndex,
    },
  );
}

export function unwrapElements(containers: ContainerElementHandle[]) {
  if (containers.length === 0) return;
  return containers
    .flatMap(unwrapContainer as any)
    .filter(Boolean) as ElementHandle[];
}
