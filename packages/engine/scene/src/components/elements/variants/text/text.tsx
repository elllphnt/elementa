import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren } from "react";
import type { TextElementRenderable } from "../../../../renderables/element/text.js";
import { useBaseElementProps } from "../../base/context.js";
import { TextElementEditor } from "./editor.js";
import { TextElementViewer } from "./viewer.js";

export function TextVariantProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps<TextElementRenderable>();

  const mode = useObservable(props.element.mode$, props.element.mode);

  if (mode === "edit") {
    return <TextElementEditor key="editor">{children}</TextElementEditor>;
  } else {
    return <TextElementViewer key="viewer">{children}</TextElementViewer>;
  }
}
