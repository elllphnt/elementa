import { ElementData, entityTypes } from "@elllphnt/elll-element";
import { ElementTool } from "./element";
import { Component, ContainerElement, Element } from "@repo/elementa-models";

export class ContainerTool extends ElementTool {
  readonly fill: boolean;

  constructor({ fill }: { fill?: boolean } = {}) {
    super({
      name: fill ? "container-filled" : "container",
      entityType: entityTypes.elements.container,
    });
    this.fill = fill ?? false;
  }

  createElement({
    component,
    punctual,
  }: {
    component: Component;
    punctual?: boolean;
  }): Element {
    const element = new ContainerElement({
      component,
    });

    const style = element.stylesheet.baseStyle(true);
    style.setProperty("display", "flex");
    style.setProperty("align-items", "center");
    style.setProperty("justify-content", "center");
    style.setProperty("gap-x", 8);
    style.setProperty("gap-y", 8);

    if (punctual) {
      style.setProperty("height", {
        value: 100,
        unit: "px",
      });
      style.setProperty("width", {
        value: 100,
        unit: "px",
      });
    }
    if (this.fill) {
      style.setProperty("background", {
        r: 250,
        g: 250,
        b: 250,
        a: 1,
      });
    }

    return element;
  }
}
