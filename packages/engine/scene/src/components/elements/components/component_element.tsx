import { logger } from "@elllphnt/elementa-kernel";
import { useObservable } from "@elllphnt/elementa-react-utils";
import { JSX } from "react";
import { ComponentElementRenderable } from "../../../renderables/element/component.js";
import { Renderable } from "../../../renderables/renderable.js";
import ComponentComponent from "../../component/component.js";
import { ElementComponent } from "../element.js";
import { ComponentPlaceHolder } from "./placeholder.js";

export function ComponentElementContent({
  element,
}: {
  element: ComponentElementRenderable;
  onRef?: (element: HTMLElement | null) => void;
}) {
  logger.debug("Rendering ComponentElementContent", { element });

  const children = useObservable(element.children$, element.children);

  logger.debug("ComponentElementContent: Children resolved", {
    children,
    childrenCount: children.length,
  });

  return (
    <>
      {children.map((child) => (
        <ElementComponent key={child.key} element={child} />
      ))}
    </>
  );
}

export function ComponentElementComponentContent({
  element,
  onRef,
}: {
  element: ComponentElementRenderable;
  onRef?: (element: HTMLElement | null, key?: string) => void;
}): JSX.Element {
  logger.debug("Rendering ComponentElementComponentContent", { element });

  const component = useObservable(element.component$, element.component);

  logger.debug("ComponentElementComponentContent: Component resolved", {
    component,
    hasComponent: !!component,
  });

  if (!component) {
    logger.debug(
      "ComponentElementComponentContent: No component, rendering empty"
    );
    return <></>;
  }

  return (
    <ComponentComponent component={component} onRef={onRef}>
      <ComponentElementContent element={element} onRef={onRef} />
    </ComponentComponent>
  );
}

export function ComponentElementComponent({
  element,
  onRef,
}: {
  element: ComponentElementRenderable;
  data?: unknown;
  onRef?: (element: HTMLElement | null) => void;
}): JSX.Element {
  logger.debug("Rendering ComponentElementComponent", { element });

  const model = useObservable(
    element.instance.element.component$,
    element.instance.element.component
  );
  const component = useObservable(model?.model$, model?.model);

  logger.debug("ComponentElementComponent: Model and component resolved", {
    model,
    component,
    hasComponent: !!component,
  });

  if (!component) {
    logger.debug(
      "ComponentElementComponent: No component, rendering placeholder"
    );
    return (
      <ComponentPlaceHolder
        element={element}
        key="placeholder"
        component={component}
      />
    );
  } else {
    logger.debug("ComponentElementComponent: Rendering component content");
    return (
      <ComponentElementComponentContent
        element={element}
        onRef={(e, key) => {
          logger.debug("ComponentElementComponent: Setting HTML element", {
            element: e,
            key: key || Renderable.defaultHtmlElementKey,
          });
          element.setHtmlElement(key || Renderable.defaultHtmlElementKey, e);
          onRef?.(e);
        }}
      />
    );
  }
}

export default ComponentElementComponent;
