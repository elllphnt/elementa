import { useObservable } from "@elllphnt/elementa-utils";
import cx from "classnames";
import { ElementHandle, PrimitiveElementHandle } from "~/src/handles/_";
import { useHandleDom } from "../_hooks/interaction_target";
import { ElementHandleComponent } from "./element";

export function PrimitiveElementHandleComponent({
  element,
}: {
  element: PrimitiveElementHandle;
}) {
  const children = useObservable(element.children$, element.children);
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <>
      <div
        ref={(r) => {
          setRectHtmlElement(r);
          addInteractionTarget(r);
        }}
        className={cx(
          "interaction-target elementa-handle elementa-handle-container"
        )}
      />
      {children.map((child) => (
        <ElementHandleComponent
          key={child.key}
          element={child as ElementHandle}
        />
      ))}
    </>
  );
}
