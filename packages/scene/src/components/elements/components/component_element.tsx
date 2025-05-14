import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { ComponentElementRenderable } from "../../../renderables/element/component.js";
import { Renderable } from "../../../renderables/renderable.js";
import ComponentComponent from "../../component/component.js";
import { ComponentPlaceHolder } from "./placeholder.js";

export function ComponentElementComponentContent({
  element,
  onRef,
}: {
  element: ComponentElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  const component = useObservable(element.component$, element.component);

  if (!component) {
    return <></>;
  }

  return <ComponentComponent component={component} onRef={onRef} />;
}

export function ComponentElementComponent({
  element,
  onRef,
}: {
  element: ComponentElementRenderable;
  data?: unknown;
  onRef?: (element: HTMLElement | null) => void;
}): JSX.Element {
  const model = useObservable(
    element.instance.element.component$,
    element.instance.element.component
  );
  const component = useObservable(model?.model$, model?.model);

  if (!component) {
    return (
      <ComponentPlaceHolder
        element={element}
        key="placeholder"
        component={component}
      />
    );
  } else {
    return (
      <ComponentElementComponentContent
        element={element}
        onRef={(e, key) => {
          element.setHtmlElement(key || Renderable.defaultHtmlElementKey, e);
          onRef?.(e);
        }}
      />
    );
  }
}

export default ComponentElementComponent;
