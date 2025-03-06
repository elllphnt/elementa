import { useObservable } from "@repo/utils";
import { useNamespace } from "../../hooks/namespace";
import { ContainerElementRenderable } from "../../renderables/instances/element/container";
import { BaseElementComponent } from "./_/_base_element";
import ElementComponent from "./element";
// import ElementView from "./element";

export function ContainerElementComponent({
  element,
  partKey,
}: {
  element: ContainerElementRenderable;
  partKey?: string;
}): JSX.Element {
  return (
    <BaseElementComponent key={element.key} element={element} partKey={partKey}>
      <ContainerElementContent element={element} />
    </BaseElementComponent>
  );
}

export function ContainerElementContent({
  element,
}: {
  element: ContainerElementRenderable;
  onRef?: (element: HTMLElement | null) => void;
}): JSX.Element {
  const children = useObservable(element.children$, element.children);
  const contentExpression = useObservable(
    element.entity.contentExpression$,
    element.entity.contentExpression,
  );
  const namespace = useNamespace();

  if (contentExpression) {
    const value = namespace.resolveExpression(contentExpression);
    return value;
  } else {
    return (
      <>
        {children.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </>
    );
  }
}
