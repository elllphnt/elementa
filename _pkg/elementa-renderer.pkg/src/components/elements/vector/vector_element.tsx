import { useObservable } from "@repo/utils";
import { useNamespace } from "../../../hooks/namespace";
import { VectorElementRenderable } from "../../../renderables/instances/element/vector";
import { BaseElementComponent } from "../_/_base_element";
import { VectorDocument } from "./document";

export function VectorElementComponent({
  element,
  partKey,
}: {
  element: VectorElementRenderable;
  partKey?: string;
}): JSX.Element {
  const content = useObservable(
    element.entity.content$,
    element.entity.content,
  );
  const namespace = useNamespace();
  const resolvedContent = namespace.resolveValue(content);

  return (
    <BaseElementComponent element={element} partKey={partKey}>
      {resolvedContent ? <VectorDocument data={resolvedContent} /> : <></>}
    </BaseElementComponent>
  );
}

export default VectorElementComponent;
