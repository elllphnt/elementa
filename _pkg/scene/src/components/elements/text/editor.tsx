import { useEffect, useRef } from "react";
import { BaseElementComponent } from "../_/_base_element";
import { TextElementRenderable } from "../../../renderables/element/text";

export function TextElementEditor({
  element,
  partKey,
}: {
  element: TextElementRenderable;
  partKey?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const elementHtml = ref.current;
    if (!elementHtml) return;

    element.setEditorHtmlElement(elementHtml);
    return () => {
      element.setEditorHtmlElement(null);
    };
  }, [element]);

  return (
    <BaseElementComponent
      partKey={partKey}
      element={element}
      onRef={(el: any) => {
        ref.current = el;
      }}
    />
  );
}
