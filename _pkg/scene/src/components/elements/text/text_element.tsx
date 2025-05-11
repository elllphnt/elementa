import { useObservable } from "@elllphnt/elementa-react-utils";
import { TextElementRenderable } from "../../../renderables/element/text.js";
import { TextElementEditor } from "./editor.js";
import { TextElementViewer } from "./viewer.js";

export function TextElementComponent({
  element,
  partKey,
}: {
  element: TextElementRenderable;
  partKey?: string;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
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
