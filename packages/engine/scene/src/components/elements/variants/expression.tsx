import { useObservable } from "@elllphnt/elementa-react-utils";
import { PropsWithChildren, ReactNode } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { renderingLogger } from "../../../loggers.js";
import { ExpressionElementRenderable } from "../../../renderables/element/expression.js";
import {
  BaseElementProps,
  BaseElementPropsContext,
  useBaseElementProps,
} from "../base/context.js";

export function ExpressionVariantProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps<ExpressionElementRenderable>();

  const expression = useObservable(
    props.element.instance.element.expression$,
    props.element.instance.element.expression
  );
  const namespace = useNamespace();
  const value = expression ? (
    (namespace.resolveExpression({
      __expression: expression,
    }) as ReactNode)
  ) : (
    <></>
  );

  const updatedProps: BaseElementProps = {
    ...props,
    children: value,
  };

  renderingLogger.debug("ExpressionVariantProvider", {
    type: props.element.instance.element.type,
    expression,
    value,
    namespace,
  });

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
