import { useObservable } from "@elllphnt/elementa-utils";
import cx from "classnames";
import { ContainerElementHandle, ElementHandle } from "~/handles/_";
import { PaddingMarker } from "../_markers/padding_marker.js";
import { BaseElementHandleComponent } from "./_base.js";
import { ElementHandleComponent } from "./element.js";

export function ContainerElementHandleComponent({
  element,
}: {
  element: ContainerElementHandle;
}) {
  const children = useObservable(element.children$, element.children);

  return (
    <>
      <BaseElementHandleComponent
        element={element}
        className={cx(
          "interaction-target elementa-handle elementa-handle-container"
        )}
      >
        <PaddingMarker handle={element} />
      </BaseElementHandleComponent>
      {children.map((child) => (
        <ElementHandleComponent
          key={child.key}
          element={child as ElementHandle}
        />
      ))}
    </>
  );
}
