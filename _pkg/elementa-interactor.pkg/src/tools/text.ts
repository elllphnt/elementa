import { entityTypes } from "@elllphnt/elll-element";
import { Component, Element, TextElement } from "@repo/elementa-models";
import { ElementHandle, TextElementHandle } from "../handles/_";
import { ElementTool } from "./element";

export class TextTool extends ElementTool {
  constructor() {
    super({
      name: "text",
      entityType: entityTypes.elements.text,
    });
  }

  onCreated(element: ElementHandle): void {
    element.focus();
    setTimeout(() => {
      (element as TextElementHandle).selectAll();
    });
  }

  createElement({
    component,
  }: {
    component: Component;
    punctual?: boolean;
  }): Element {
    const element = new TextElement({
      component,
    });

    element.setContent({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello World!",
            },
          ],
        },
      ],
    });

    return element;
  }
}
