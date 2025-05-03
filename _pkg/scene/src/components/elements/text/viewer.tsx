import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../../hooks/namespace";
import { TextElementRenderable } from "../../../renderables/element/text";
import { BaseElementComponent } from "../_/_base_element";

export function TextElementViewer({
  element,
  partKey,
}: {
  element: TextElementRenderable;
  partKey?: string;
}) {
  const text = useObservable(
    element.instance.element.text$,
    element.instance.element.text
  );
  const namespace = useNamespace();

  return (
    <BaseElementComponent element={element} partKey={partKey}>
      {`${namespace.resolveValue(text ?? "") ?? ""}` || <span>&nbsp;</span>}
    </BaseElementComponent>
  );
}
