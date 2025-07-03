import { ElementData, entityTypes } from "@elllphnt/elementa-base";
import { Component, Element, SlotElement } from "@elllphnt/elementa-models";
import { ElementTool } from "./element.js";

export class SlotTool extends ElementTool {
  constructor() {
    super({
      name: "slot",
      entityType: entityTypes.elements.slot,
    });
  }

  createElement({
    component,
    punctual,
  }: {
    component: Component;
    punctual?: boolean;
  }): Element<ElementData> {
    const element = new SlotElement({
      component,
    });

    const style = element.stylesheet.baseStyle(true);
    style.setProperty("display", "flex");
    style.setProperty("align-items", "center");
    style.setProperty("justify-content", "center");
    style.setProperty("gap-x", {
      value: 8,
      unit: "px",
    });
    style.setProperty("gap-y", {
      value: 8,
      unit: "px",
    });

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

    return element;
  }
}
