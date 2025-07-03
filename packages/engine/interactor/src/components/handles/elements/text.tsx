import cx from "classnames";
import type { TextElementHandle } from "~/handles/renderables/element/text/text.js";
import { useHandleDom } from "../_hooks/interaction_target.js";

export function TextElementHandleComponent({
  element,
}: {
  element: TextElementHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <div
      ref={(r) => {
        setRectHtmlElement(r);
        addInteractionTarget(r);
      }}
      className={cx("interaction-target elementa-handle elementa-handle-text")}
    ></div>
  );
}
