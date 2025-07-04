import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren } from "react";
import { useNamespace } from "../../../hooks/namespace.js";
import { useBaseElementProps } from "../base/context.js";

export function ElementConditionProvider({ children }: PropsWithChildren) {
  const { element } = useBaseElementProps();
  const namespace = useNamespace();
  const conditionEvaluable = useObservable(
    element.instance.element.condition$,
    element.instance.element.condition
  );
  const conditionValue = namespace.resolveValue(conditionEvaluable);
  if (conditionValue !== undefined && !conditionValue) {
    return <></>;
  } else {
    return children;
  }
}
