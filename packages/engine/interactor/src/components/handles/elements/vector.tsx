import cx from "classnames";
import type { VectorElementHandle } from "~/handles/renderables/element/vector.js";
import { useHandleDom } from "../_hooks/interaction_target.js";

export function VectorElementHandleComponent({
  element,
}: {
  element: VectorElementHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <div
      ref={(r) => {
        setRectHtmlElement(r);
        addInteractionTarget(r);
      }}
      className={cx(
        "interaction-target elementa-handle elementa-handle-vector"
      )}
    ></div>
  );
}
