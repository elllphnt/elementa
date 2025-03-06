import { useObservable } from "@repo/utils";
import cx from "classnames";
import {
  CodeComponentElementHandle,
  ComponentElementHandle,
} from "~/src/handles/_";
import { useHandleDom } from "../../_hooks/interaction_target";
import { PaddingMarker } from "../../_markers/padding_marker";
import { ElementHandleComponent } from "../element";

export function CodeComponentElementHandleComponent({
  element,
}: {
  element: CodeComponentElementHandle;
}) {
  const isUnwrappable = useObservable(
    element.instance.isUnwrappable$,
    element.instance.isUnwrappable,
  );
  const children = useObservable(element.children$, element.children);

  if (isUnwrappable) {
    (window as any).unw = element;
    console.log("Unwrappable", element);
  }

  if (0) {
    <>
      {children.map((child) => (
        <ElementHandleComponent key={child.key} element={child} />
      ))}
    </>;
  } else {
    return (
      <>
        <ComponentElementHandlePart
          partKey={element.partKey}
          element={element}
        />
        {children.map((child) => (
          <ElementHandleComponent key={child.key} element={child} />
        ))}
      </>
    );
  }
}

export function ComponentElementHandlePart({
  partKey,
  element,
  padding,
}: {
  partKey?: string;
  element: ComponentElementHandle;
  padding?: boolean;
}) {
  const { setRectHtmlElement, addInteractionTarget } = useHandleDom(element);

  return (
    <div
      ref={(r) => {
        partKey ? setRectHtmlElement(partKey, r) : setRectHtmlElement(r);
        addInteractionTarget(r);
      }}
      className={cx(
        "interaction-target elementa-handle elementa-handle-container",
      )}
    >
      {padding && <PaddingMarker handle={element} />}{" "}
    </div>
  );
}
