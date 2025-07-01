import { logger } from "@elllphnt/elementa-kernel";
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
  logger.debug("Rendering TextElementComponent", { element, partKey });

  const mode = useObservable(element.mode$, element.mode);

  logger.debug("TextElementComponent: Mode resolved", { mode });

  if (mode === "edit") {
    logger.debug("TextElementComponent: Rendering editor mode");
    return (
      <TextElementEditor key="editor" element={element} partKey={partKey} />
    );
  } else {
    logger.debug("TextElementComponent: Rendering viewer mode");
    return (
      <TextElementViewer key="viewer" element={element} partKey={partKey} />
    );
  }
}

export default TextElementComponent;
