import { useObservable } from "@elllphnt/elementa-react-utils";
import { useNamespace } from "../../hooks/namespace.js";
import { ExpressionElementRenderable } from "../../renderables/_.js";

export function ExpressionElementComponent({
  element,
}: {
  element: ExpressionElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}) {
  const expression = useObservable(
    element.instance.element.expression$,
    element.instance.element.expression
  );
  const namespace = useNamespace();
  if (!expression) return <></>;
  const value = namespace.resolveExpression({
    __expression: expression,
  });

  return <>{value}</>;
}
