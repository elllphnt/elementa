import { Component } from "@elllphnt/elementa-models";
import { ComponentElementRenderable } from "../../../renderables/element/component.js";
import { Renderable } from "../../../renderables/renderable.js";

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
