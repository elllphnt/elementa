import { useObservable } from "@elllphnt/elementa-react-utils";
import { ComponentType } from "react";
import { useNamespace } from "../../../hooks/namespace";
import { ElementRenderable } from "../../../renderables/element/element";

export function HideableElementComponent<
  P extends { element: ElementRenderable }
>(ComponentElement: ComponentType<P>) {
  return ({ element, ...props }: P) => {
    const namespace = useNamespace();
    const condition = useObservable(
      element.instance.element.condition$,
      element.instance.element.condition
    );

    const conditionValue = namespace.resolveValue(condition) ?? true;

    if (conditionValue) {
      return <ComponentElement element={element} {...(props as any)} />;
    } else {
      return <></>;
    }
  };
}
