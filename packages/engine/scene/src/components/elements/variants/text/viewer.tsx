import { useObservable } from "@elllphnt/elementa-react-utils";
import { PropsWithChildren } from "react";
import { useNamespace } from "../../../../hooks/namespace.js";
import { TextElementRenderable } from "../../../../renderables/element/text.js";
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

  const updatedProps = {
    ...props,
    children: propsChildren,
  };

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
