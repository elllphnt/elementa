import cx from "classnames";
import { TextElementHandle } from "~/src/handles/_";
import { useHandleDom } from "../_hooks/interaction_target";
import { PaddingMarker } from "../_markers/padding_marker";

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
    >
      <PaddingMarker handle={element} />
    </div>
  );
}
