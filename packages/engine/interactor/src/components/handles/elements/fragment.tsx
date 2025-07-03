import cx from "classnames";
import type { FragmentElementHandle } from "~/handles/renderables/element/fragment.js";
import { useHandleDom } from "../_hooks/interaction_target.js";

export function FragmentElementHandleComponent({
  element,
}: {
  element: FragmentElementHandle;
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
