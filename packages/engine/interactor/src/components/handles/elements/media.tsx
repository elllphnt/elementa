import cx from "classnames";
import type { MediaElementHandle } from "~/handles/renderables/element/media.js";
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
