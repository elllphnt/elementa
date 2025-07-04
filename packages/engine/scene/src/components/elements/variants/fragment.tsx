import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren, ReactNode } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { renderingLogger } from "../../../loggers.js";
import type { FragmentElementRenderable } from "../../../renderables/element/fragment.js";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../base/context.js";

export function FragmentVariantProvider({ children }: PropsWithChildren) {
  const namespace = useNamespace();
  const props = useBaseElementProps<FragmentElementRenderable>();

  const fragmentId = useObservable(
    props.element.instance.element.fragmentId$,
    props.element.instance.element.fragmentId
  );
  const params = useObservable(
    props.element.instance.element.params$,
    props.element.instance.element.params
  );

  const fragment = fragmentId
    ? namespace.get<(params: Record<string, any>) => ReactNode>([
        "fragments",
        fragmentId,
      ])
    : undefined;

  const propsChildren = fragment ? fragment(params) : <></>;

  const updatedProps = {
    ...props,
    children: propsChildren,
  };

  renderingLogger.debug("FragmentVariantProvider", {
    namespace,
    children,
    props,
    params,
    Fragment: fragment,
  });

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
