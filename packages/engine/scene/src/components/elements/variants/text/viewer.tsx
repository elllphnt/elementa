import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren } from "react";
import { useNamespace } from "../../../../hooks/namespace.js";
import type { TextElementRenderable } from "../../../../renderables/element/text.js";
import type { BaseElementProps } from "../../base/context.js";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../../base/context.js";

export function TextElementViewer({ children }: PropsWithChildren) {
  const props = useBaseElementProps<TextElementRenderable>();
  const text = useObservable(
    props.element.instance.element.text$,
    props.element.instance.element.text
  );
  const namespace = useNamespace();
  const propsChildren = `${namespace.resolveValue(text ?? "") ?? ""}` || (
    <span>&nbsp;</span>
  );

  const updatedProps: BaseElementProps<TextElementRenderable> = {
    ...props,
    component: "span",
    children: propsChildren,
  };

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
