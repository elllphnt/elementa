import { useObservable } from "@elllphnt/elementa-utils";
import cx from "classnames";
import type { ComponentElementHandle } from "~/handles/_";
import { FragmentHandleComponent } from "../fragment.js";
import { BaseElementHandleComponent } from "./_base.js";

export function ComponentElementHandleComponent({
  element,
}: {
  element: ComponentElementHandle;
}) {
  const template = useObservable(element.template$, element.template);

  return (
    <>
      <BaseElementHandleComponent
        element={element}
        className={cx(
          "interaction-target elementa-handle elementa-handle-container"
        )}
      />
      {template ? <FragmentHandleComponent fragment={template} /> : <></>}
    </>
  );
}
