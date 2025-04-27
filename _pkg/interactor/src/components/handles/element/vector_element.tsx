import cx from "classnames";
import { useHandleDom } from "../_hooks/interaction_target";
import { PaddingMarker } from "../_markers/padding_marker";
import { VectorElementHandle } from "~/src/handles/_";

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
        "interaction-target elementa-handle elementa-handle-vector",
      )}
    >
      <PaddingMarker handle={element} />
    </div>
  );
}
