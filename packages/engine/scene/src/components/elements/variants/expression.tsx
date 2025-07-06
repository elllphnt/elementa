import { useObservable } from "@elllphnt/elementa-react-utils";
import type { ReactNode } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { renderingLogger } from "../../../loggers.js";
import type { ExpressionElementRenderable } from "../../../renderables/element/expression.js";
import { useBaseElementProps } from "../base/context.js";

export function ExpressionVariantProvider() {
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

  renderingLogger.debug("ExpressionVariantProvider", {
    type: props.element.instance.element.type,
    expression,
    value,
    namespace,
  });

  return value;
}
