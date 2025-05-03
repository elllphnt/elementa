import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { ComponentElementRenderable } from "../../../renderables/element/component";
import { Renderable } from "../../../renderables/renderable";
import ComponentComponent from "../../component/component";
import { ComponentPlaceHolder } from "./placeholder";

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
  data,
  onRef,
}: {
  element: ComponentElementRenderable;
  data?: any;
  onRef?: (element: HTMLElement | null) => void;
}): JSX.Element {
  const model = useObservable(
    element.instance.element.localComponent$,
    element.instance.element.localComponent
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
