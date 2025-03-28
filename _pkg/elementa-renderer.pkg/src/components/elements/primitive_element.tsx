import { useObservable } from "@repo/utils";
import React, { forwardRef } from "react";
import { useNamespace } from "~/src/hooks/namespace";
import { PrimitiveElementRenderable } from "~/src/renderables/instances/_";
import { BaseElementComponent } from "./_/_base_element";
import ElementComponent from "./element";

function useContent({ element }: { element: PrimitiveElementRenderable }) {
  const children = useObservable(element.children$, element.children);
  const contentExpression = useObservable(
    element.entity.contentExpression$,
    element.entity.contentExpression,
  );
  const namespace = useNamespace();

  if (contentExpression) {
    const value = namespace.resolveExpression(contentExpression);
    return value as React.ReactNode;
  } else {
    return children.map((child) => (
      <ElementComponent key={child.key} element={child} />
    ));
  }
}

export function PrimitiveElementComponent({
  element,
  data,
  onRef,
}: {
  element: PrimitiveElementRenderable;
  data?: any;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  return (
    <BaseElementComponent
      element={element}
      component={PrimitiveElementComponentContent}
      onRef={onRef}
    />
  );
}

export const PrimitiveElementComponentContent = forwardRef(
  (
    {
      __element: element,
      ...forwardedProps
    }: { __element: PrimitiveElementRenderable },
    ref,
  ): JSX.Element => {
    const namespace = useNamespace();
    const Component = useObservable(
      element.instance.localComponent$,
      element.instance.localComponent,
    );
    const props = useObservable(
      element.entity.resolvedProps$,
      element.entity.resolvedProps,
    );
    const content = useContent({ element });

    if (!Component) {
      return <></>;
    }

    const resolvedProps = Object.fromEntries(
      Object.entries(props).map(([key, value]) => [
        key,
        namespace.resolveValue(value),
      ]),
    );

    return (
      <>
        <Component ref={ref} {...forwardedProps} {...resolvedProps}>
          {content}
        </Component>
      </>
    );
  },
);

export default PrimitiveElementComponent;
