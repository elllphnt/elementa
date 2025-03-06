import { useObservable } from "@repo/utils";
import cx from "classnames";
import { useHandleDom } from "../../_hooks/interaction_target";
import { HandleConnectionSet } from "../../connection_set";
import { PortHandleComponent } from "./port";

export function ControllerWidgetHandleComponent({
  widget,
}: {
  widget: ControllerWidgetHandle;
}) {
  const { setRectHtmlElement } = useHandleDom(widget);
  const ports = useObservable(widget.ports$, widget.ports);

  return (
    <>
      <div
        className={cx("elementa-handle elementa-handle-controller")}
        ref={(element) => {
          setRectHtmlElement(element);
          if (element) widget.addInteractionTarget(element);
        }}
      />
      {ports.map((port) => (
        <PortHandleComponent key={port.key} port={port} />
      ))}
      <HandleConnectionSet handle={widget} />
    </>
  );
}
