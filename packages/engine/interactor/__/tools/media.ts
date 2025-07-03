import { entityTypes } from "@elllphnt/elementa-base";
import { Component, MediaElement } from "@elllphnt/elementa-models";
import { ElementTool } from "./element.js";

export class MediaTool extends ElementTool {
  constructor() {
    super({
      name: "media",
      entityType: entityTypes.elements.media,
    });
  }

  createElement({
    component,
    punctual,
  }: {
    component: Component;
    punctual?: boolean;
  }): MediaElement {
    const element = new MediaElement({
      component,
    });

    if (punctual) {
      const style = element.stylesheet.baseStyle(true);
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
