import { useObservable } from "@repo/utils";
import cx from "classnames";
import { memo } from "react";
import { SlotHandle } from "~/src/handles/entities/slot";
import { useHandleDom } from "./_hooks/interaction_target";
import { ElementHandleComponent } from "./element/element";

export const SlotHandleComponent = memo(function SlotHandleComponent({
  slot,
}: {
  slot: SlotHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(slot);
  const children = useObservable(slot.children$, slot.children);

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
      />
      {children.map((child) => (
        <ElementHandleComponent key={child.key} element={child} />
      ))}
    </>
  );
});
