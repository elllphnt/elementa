import { useObservable } from "@elllphnt/elementa-react-utils";
import cx from "classnames";
import type { ContainerElementHandle } from "~/handles/renderables/element/container.js";
import type { ElementHandle } from "~/handles/renderables/element/element.js";
import { useHandleDom } from "../_hooks/interaction_target.js";
import { ElementHandleComponent } from "./element.js";

export function ContainerElementHandleComponent({
  element,
}: {
  element: ContainerElementHandle;
}) {
  const content = useObservable(element.content$, element.content);
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
      {content.map((child) => (
        <ElementHandleComponent
          key={child.key}
          element={child as ElementHandle}
        />
      ))}
    </>
  );
}
