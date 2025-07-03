import cx from "classnames";
import { VectorElementHandle } from "~/handles/_";
import { useHandleDom } from "../_hooks/interaction_target.js";
import { PaddingMarker } from "../_markers/padding_marker.js";

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
    >
      <PaddingMarker handle={element} />
    </div>
  );
}
