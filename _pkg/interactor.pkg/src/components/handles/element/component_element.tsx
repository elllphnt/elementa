import { useObservable } from "@repo/utils";
import cx from "classnames";
import { ComponentElementHandle } from "~/src/handles/_";
import { FragmentHandleComponent } from "../fragment";
import { BaseElementHandleComponent } from "./_base";

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
          "interaction-target elementa-handle elementa-handle-container",
        )}
      />
      {template ? <FragmentHandleComponent fragment={template} /> : <></>}
    </>
  );
}
