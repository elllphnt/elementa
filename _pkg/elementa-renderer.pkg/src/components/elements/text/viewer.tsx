import { useObservable } from "@repo/utils";
import { useNamespace } from "~/src/hooks/namespace";
import { TextElementRenderable } from "../../../renderables/instances/element/text";
import { BaseElementComponent } from "../_/_base_element";

export function TextElementViewer({
  element,
  partKey,
}: {
  element: TextElementRenderable;
  partKey?: string;
}): JSX.Element {
  const text = useObservable(
    element.instance.entity.text$,
    element.instance.entity.text,
  );
  const namespace = useNamespace();

  return (
    <BaseElementComponent element={element} partKey={partKey} component="span">
      {`${namespace.resolveValue(text || "") || ""}` || <span>&nbsp;</span>}
    </BaseElementComponent>
  );
}
