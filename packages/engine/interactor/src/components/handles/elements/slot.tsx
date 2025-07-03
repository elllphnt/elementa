import { useObservable } from "@elllphnt/elementa-react-utils";
import cx from "classnames";
import type { ElementHandle } from "~/handles/renderables/element/element.js";
import type { SlotElementHandle } from "~/handles/renderables/element/slot.js";
import { useHandleDom } from "../_hooks/interaction_target.js";
import { ElementHandleComponent } from "./element.js";

export function SlotElementHandleComponent({
  element,
}: {
  element: SlotElementHandle;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);
  const content = useObservable(element.content$, element.content);

  return (
    <>
      <div
        ref={(r) => {
          setRectHtmlElement(r);
          addInteractionTarget(r);
        }}
        className={cx(
          "interaction-target elementa-handle elementa-handle-slot"
        )}
      ></div>
      {content.map((child) => (
        <ElementHandleComponent
          key={child.key}
          element={child as ElementHandle}
        />
      ))}
    </>
  );
}
