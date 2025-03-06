import { useObservable } from "@repo/utils";
import { TextElementRenderable } from "../../../renderables/instances/element/text";
import { TextElementEditor } from "./editor";
import { TextElementViewer } from "./viewer";

export function TextElementComponent({
  element,
  partKey,
}: {
  element: TextElementRenderable;
  partKey?: string;
}): JSX.Element {
  const mode = useObservable(element.mode$, element.mode);

  if (mode === "edit") {
    return (
      <TextElementEditor key="editor" element={element} partKey={partKey} />
    );
  } else {
    return (
      <TextElementViewer key="viewer" element={element} partKey={partKey} />
    );
  }
}

export default TextElementComponent;
