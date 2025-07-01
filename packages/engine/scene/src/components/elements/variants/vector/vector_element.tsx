import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../../../hooks/namespace.js";
import { VectorElementRenderable } from "../../../../renderables/element/vector.js";
import { BaseElementComponent } from "../../_/_base_element.js";

export function VectorElementComponent({
  element,
  partKey,
}: {
  element: VectorElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const content = useObservable(
    element.instance.element.content$,
    element.instance.element.content
  );
  const namespace = useNamespace();
  const resolvedContent = namespace.resolveValue(content);

  return (
    <BaseElementComponent
      element={element}
      partKey={partKey}
    ></BaseElementComponent>
  );
}

export default VectorElementComponent;
