import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../hooks/namespace";
import { ContainerElementRenderable } from "../../renderables/element/container";
import { BaseElementComponent } from "./_/_base_element";
import ElementComponent from "./element";
// import ElementView from "./element";

export function ContainerElementComponent({
  element,
  onRef,
}: {
  element: ContainerElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
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
  const children = useObservable(element.children$, element.children);
  const namespace = useNamespace();

  return (
    <>
      {children.map((child) => (
        <ElementComponent key={child.key} element={child} />
      ))}
    </>
  );
}
