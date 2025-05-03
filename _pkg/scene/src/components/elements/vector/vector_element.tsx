import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../../hooks/namespace";
import { VectorElementRenderable } from "../../../renderables/element/vector";
import { BaseElementComponent } from "../_/_base_element";

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
