import { useObservable } from "@repo/utils";
import { TextElementRenderable } from "../../../renderables/instances/element/text";
import { BaseElementComponent } from "../_/_base_element";
import { TextContent } from "./content";

export function TextElementViewer({
  element,
  partKey,
}: {
  element: TextElementRenderable;
  partKey?: string;
}): JSX.Element {
  const content = useObservable(
    element.instance.entity.content$,
    element.instance.entity.content,
  );

  return (
    <BaseElementComponent element={element} partKey={partKey}>
      <TextContent document={content} />
    </BaseElementComponent>
  );
}
