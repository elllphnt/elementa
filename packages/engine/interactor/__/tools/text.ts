import { entityTypes } from "@elllphnt/elementa-base";
import type { Component, Element} from "@elllphnt/elementa-models";
import { TextElement } from "@elllphnt/elementa-models";
import type { ElementHandle, TextElementHandle } from "../handles/_.js";
import { ElementTool } from "./element.js";

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

    element.setText("Hello World!");

    return element;
  }
}
