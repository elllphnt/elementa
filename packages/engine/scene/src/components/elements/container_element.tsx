import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { ContainerElementRenderable } from "../../renderables/element/container.js";
import { BaseElementComponent } from "./_/_base_element.js";
import ElementComponent from "./element.js";
// import ElementView from "./element.js";

export function ContainerElementComponent({
  element,
  onRef,
}: {
  element: ContainerElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  logger.debug("Rendering ContainerElementComponent", { element });

  return (
    <BaseElementComponent key={element.key} element={element} onRef={onRef}>
      <ContainerElementContent element={element} />
    </BaseElementComponent>
  );
}

export function ContainerElementContent({
  element,
}: {
  element: ContainerElementRenderable;
  onRef?: (element: HTMLElement | null) => void;
}) {
  logger.debug("Rendering ContainerElementContent", { element });

  const children = useObservable(element.children$, element.children);

  logger.debug("ContainerElementContent: Children resolved", {
    children,
    childrenCount: children.length,
  });

  return (
    <>
      {children.map((child) => (
        <ElementComponent key={child.key} element={child} />
      ))}
    </>
  );
}
