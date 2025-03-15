import { useObservable } from "@repo/utils";
import cx from "classnames";
import { ElementHandle, SlotElementHandle } from "~/src/handles/_";
import { useHandleDom } from "../_hooks/interaction_target";
import { PaddingMarker } from "../_markers/padding_marker";
import { ElementHandleComponent } from "./element";

export function SlotElementHandleComponent({
  element,
}: {
  element: SlotElementHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);
  const children = useObservable(element.children$, element.children);

  return (
    <>
      <div
        ref={(r) => {
          setRectHtmlElement(r);
          addInteractionTarget(r);
        }}
        className={cx(
          "interaction-target elementa-handle elementa-handle-slot",
        )}
      >
        <PaddingMarker handle={element} />
      </div>
      {children.map((child) => (
        <ElementHandleComponent
          key={child.key}
          element={child as ElementHandle}
        />
      ))}
    </>
  );
}
