import { entityTypes } from "@elllphnt/elll-element";
import { ElementTool } from "./element";
import { Component, VectorElement } from "@repo/elementa-models";

export class VectorTool extends ElementTool {
  constructor() {
    super({
      name: "vector",
      entityType: entityTypes.elements.vector,
    });
  }

  createElement({
    component,
    punctual,
  }: {
    component: Component;
    punctual?: boolean;
  }): VectorElement {
    const element = new VectorElement({
      component,
    });

    element.setContent({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "svg",
          properties: {
            viewBox: "0 0 100 100",
          },
          children: [
            {
              type: "element",
              tagName: "circle",
              properties: {
                cx: 50,
                cy: 50,
                r: 40,
                fill: "currentColor",
              },
              children: [],
            },
          ],
        },
      ],
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
