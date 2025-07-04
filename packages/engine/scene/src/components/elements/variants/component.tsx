import type { Component } from "@elllphnt/elementa-models";
import { useObservable } from "@elllphnt/elementa-react-utils";
import type { PropsWithChildren } from "react";
import { renderingLogger } from "../../../loggers.js";
import type { ComponentElementRenderable } from "../../../renderables/element/component.js";
import { Renderable } from "../../../renderables/renderable.js";
import ComponentComponent from "../../component/component.js";
import type {
  BaseElementProps} from "../base/context.js";
import {
  BaseElementPropsContext,
  useBaseElementProps,
} from "../base/context.js";
import ElementComponent from "../element.js";

function ComponentElementContent({
  element,
}: {
  element: ComponentElementRenderable;
}) {
  const children = useObservable(element.children$, element.children);

  renderingLogger.debug("ComponentElementContent", {
    element,
    children,
  });

  return (
    <>
      {children.map((child) => (
        <ElementComponent key={child.key} element={child} />
      ))}
    </>
  );
}

export function ComponentPlaceHolder({
  element,
  component,
}: {
  element: ComponentElementRenderable;
  component?: Component;
}) {
  return (
    <div
      ref={(e) => element.setHtmlElement(Renderable.defaultHtmlElementKey, e)}
      style={{
        backgroundColor: "#8881",
        border: "1px solid #8884",
        color: "#ddd4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        flexGrow: 0,
      }}
    >
      Loading {component?.name} ...
    </div>
  );
}

export function ComponentVariantProvider({ children }: PropsWithChildren) {
  const props = useBaseElementProps<ComponentElementRenderable>();

  const component = useObservable(
    props.element.component$,
    props.element.component
  );

  const updatedProps: BaseElementProps = {
    ...props,
  };

  if (!component) {
    updatedProps.children = (
      <ComponentPlaceHolder element={props.element} key="placeholder" />
    );
  } else {
    updatedProps.children = (
      <ComponentComponent component={component}>
        <ComponentElementContent element={props.element} />
      </ComponentComponent>
    );
  }

  renderingLogger.debug("ComponentVariantProvider", {
    props,
    component,
  });

  return (
    <BaseElementPropsContext.Provider value={updatedProps}>
      {children}
    </BaseElementPropsContext.Provider>
  );
}
