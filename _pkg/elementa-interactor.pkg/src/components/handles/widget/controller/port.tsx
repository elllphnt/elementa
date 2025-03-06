import { Handle } from "~/src/handles/handle";
import { useHandleDom } from "../../_hooks/interaction_target";
import { HandleConnectionSet } from "../../connection_set";

export function PortHandleComponent({ port }: { port: Handle }) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(port);

  return (
    <>
      <div
        ref={(element) => {
          setRectHtmlElement(element);
          addInteractionTarget(element);
        }}
        className="elementa-handle interaction-target"
      />
      <HandleConnectionSet handle={port} />
    </>
  );
}
