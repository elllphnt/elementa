import { ElementData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../component";
import { createComponentElementModel } from "./component/_";
import { ContainerElement } from "./container";
import { Element } from "./element";
import { MediaElement } from "./media";
import { PrimitiveElement } from "./primitive/primitive";
import { SlotElement } from "./slot";
import { TextElement } from "./text";
import { VectorElement } from "./vector";

export function createElement(ymap: y.Map<any>, component: Component): Element {
  const type = ymap.get("type") as ElementData["type"];
  switch (type) {
    case "component":
      return createComponentElementModel(component);
    case "container":
      return new ContainerElement(ymap, component);
    case "slot":
      return new SlotElement(ymap, component);
    case "text":
      return new TextElement(ymap, component);
    case "vector":
      return new VectorElement(ymap, component);
    case "media":
      return new MediaElement(ymap, component);
    case "primitive":
      return new PrimitiveElement(ymap, component);
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
