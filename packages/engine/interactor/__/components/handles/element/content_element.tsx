import cx from "classnames";
import { MediaElementHandle } from "~/handles/_";
import { useHandleDom } from "../_hooks/interaction_target.js";

export function MediaElementHandleComponent({
  element,
}: {
  element: MediaElementHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <div
      ref={(r) => {
        setRectHtmlElement(r);
        addInteractionTarget(r);
      }}
      className={cx("interaction-target elementa-handle elementa-handle-media")}
    />
  );
}
