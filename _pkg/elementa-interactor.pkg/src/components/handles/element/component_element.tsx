import { useObservable } from "@repo/utils";
import cx from "classnames";
import { ComponentElementHandle } from "~/src/handles/_";
import { useHandleDom } from "../_hooks/interaction_target";
import { FragmentHandleComponent } from "../fragment";

export function ComponentElementHandleComponent({
  element,
}: {
  element: ComponentElementHandle;
}) {
  const template = useObservable(element.template$, element.template);
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  if (!template) {
    return <></>;
  }

  return (
    <>
      <div
        ref={(r) => {
          setRectHtmlElement(r);
          addInteractionTarget(r);
        }}
        className={cx(
          "interaction-target elementa-handle elementa-handle-container",
        )}
      />
      <FragmentHandleComponent fragment={template} />
    </>
  );
}
