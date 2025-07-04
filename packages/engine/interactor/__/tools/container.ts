import { entityTypes } from "@elllphnt/elementa-base";
import type {
  Component,
  Element} from "@elllphnt/elementa-models";
import {
  ContainerElement
} from "@elllphnt/elementa-models";
import { ElementTool } from "./element.js";

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
    if (this.fill) {
      style.setProperty("background-color", {
        model: "rgb",
        value: [255, 255, 255],
        alpha: 1,
      });
    }

    return element;
  }
}
