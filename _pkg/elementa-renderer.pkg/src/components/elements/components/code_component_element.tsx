import { useObservable } from "@repo/utils";
import React, { forwardRef } from "react";
import { useNamespace } from "~/src/hooks/namespace";
import { CodeComponentElementRenderable } from "~/src/renderables/instances/_";
import { BaseElementComponent } from "../_/_base_element";
import ElementComponent from "../element";

function useContent({ element }: { element: CodeComponentElementRenderable }) {
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

export function CodeComponentElementComponent({
  element,
  data,
  partKey,
}: {
  element: CodeComponentElementRenderable;
  data?: any;
  partKey?: string;
}): JSX.Element {
  const isUnwrappable = useObservable(
    element.instance.isUnwrappable$,
    element.instance.isUnwrappable,
  );

  if (isUnwrappable) {
    return (
      <BaseElementComponent
        element={element}
        partKey={partKey}
        component={CodeComponentElementComponentContent}
      />
    );
  } else {
    return (
      <BaseElementComponent element={element} partKey={partKey}>
        <CodeComponentElementComponentContent __element={element} />
      </BaseElementComponent>
    );
  }
}

export const CodeComponentElementComponentContent = forwardRef(
  (
    {
      __element: element,
      ...forwardedProps
    }: { __element: CodeComponentElementRenderable },
    ref,
  ): JSX.Element => {
    const namespace = useNamespace();
    const Component = useObservable(
      element.instance.localComponent$,
      element.instance.localComponent,
    );
    const props = useObservable(element.entity.props$, element.entity.props);
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
      <Component ref={ref} {...forwardedProps} {...resolvedProps}>
        {content}
      </Component>
    );
  },
);

export default CodeComponentElementComponent;
