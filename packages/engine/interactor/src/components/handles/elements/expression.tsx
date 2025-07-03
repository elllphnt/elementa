import cx from "classnames";
import type { ExpressionElementHandle } from "~/handles/renderables/element/expression.js";
import { useHandleDom } from "../_hooks/interaction_target.js";

export function ExpressionElementHandleComponent({
  element,
}: {
  element: ExpressionElementHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <div
      ref={(r) => {
        setRectHtmlElement(r);
        addInteractionTarget(r);
      }}
      className={cx(
        "interaction-target elementa-handle elementa-handle-expression"
      )}
    />
  );
}
