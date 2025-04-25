import { useObservable } from "@repo/utils";
import { ComponentType } from "react";
import { useNamespace } from "../../../hooks/namespace";
import { ElementRenderable } from "../../../renderables/instances/element/element";

export function HideableElementComponent<
  P extends { element: ElementRenderable },
>(ComponentElement: ComponentType<P>) {
  return ({ element, ...props }: P) => {
    const namespace = useNamespace();
    const hidden = useObservable(
      element.instance.hidden$,
      element.instance.hidden,
    );

    const hiddenValue = namespace.resolveValue(hidden);

    if (hiddenValue) {
      return <></>;
    } else {
      return <ComponentElement element={element} {...(props as any)} />;
    }
  };
}
