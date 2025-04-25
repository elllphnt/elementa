import { useManyObservables, useObservable } from "@repo/utils";
import cx from "classnames";
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
function usePrimitiveElementsProps({
  primitive,
}: {
  primitive: PrimitiveElementRenderable;
}) {
  const namespace = useNamespace();
  const elements = useObservable(
    primitive.entity.elements$,
    primitive.entity.elements,
  );
  const elementEntries = Object.entries(elements);
  const key = elementEntries.map((e) => `${e[0]}:${e[1]}`).join(".");
  const allDynamicStyles = useManyObservables(
    elementEntries.map((e) => e[1].stylesheet.dynamicStyles$),
    elementEntries.map((e) => e[1].stylesheet.dynamicStyles),
    key,
  );
  const allStyleExpressions = useManyObservables(
    elementEntries.map((e) => e[1].stylesheet.expressions$),
    elementEntries.map((e) => e[1].stylesheet.expressions),
    key,
  );

  const elementProps: Record<string, any> = {};

  for (let i = 0; i < elementEntries.length; ++i) {
    const [name, element] = elementEntries[i];
    const dynamicStyles = allDynamicStyles[i];
    const styleExpressions = allStyleExpressions[i];

    const dynamicClasses = Object.fromEntries(
      Object.entries(dynamicStyles).map(([key, style]) => [
        style.className,
        namespace.resolveValue(
          styleExpressions[key.slice("__expression:".length)],
        ),
      ]),
    );

    elementProps[name] = {
      className: cx(element.stylesheet.className, dynamicClasses),
    };
  }

  return elementProps;
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
    const __elements = usePrimitiveElementsProps({ primitive: element });

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
      <Component
        ref={ref}
        {...forwardedProps}
        {...resolvedProps}
        __elements={__elements}
      >
        {content}
      </Component>
    );
  },
);

export default PrimitiveElementComponent;
