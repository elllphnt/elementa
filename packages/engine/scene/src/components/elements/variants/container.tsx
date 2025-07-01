import { useObservable } from "@elllphnt/elementa-react-utils";
import { PropsWithChildren } from "react";
import { renderingLogger } from "../../../loggers.js";
import { ContainerElementRenderable } from "../../../renderables/element/container.js";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../base/context.js";
import ElementComponent from "../element.js";

export function ContainerVariantProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps<ContainerElementRenderable>();
  const elementChildren = useObservable(
    props.element.children$,
    props.element.children
  );

  const updatedProps = {
    ...props,
    children: elementChildren.length ? (
      <>
        {elementChildren.map((child) => (
          <ElementComponent key={child.key} element={child} />
        ))}
      </>
    ) : undefined,
  };

  renderingLogger.debug("ContainerVariantProvider", {
    props,
    children: elementChildren,
  });

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
