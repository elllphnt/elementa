import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../hooks/namespace.js";
import { ExpressionElementRenderable } from "../../renderables/element/expression.js";

export function ExpressionElementComponent({
  element,
}: {
  element: ExpressionElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  logger.debug("Rendering ExpressionElementComponent", { element });

  const expression = useObservable(
    element.instance.element.expression$,
    element.instance.element.expression
  );
  const namespace = useNamespace();

  logger.debug("ExpressionElementComponent: Expression resolved", {
    expression,
  });

  if (!expression) {
    logger.debug("ExpressionElementComponent: No expression, rendering empty");
    return <></>;
  }

  const value = namespace.resolveExpression({
    __expression: expression,
  });

  logger.debug("ExpressionElementComponent: Expression evaluated", {
    expression,
    value,
  });

  return <>{value}</>;
}
