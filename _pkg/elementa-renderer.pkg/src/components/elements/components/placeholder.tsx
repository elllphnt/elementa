import { Component } from "@repo/elementa-models";
import { ComponentElementRenderable, Renderable } from "~/src/renderables/_";

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
