import { ElementData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Component } from "../component";
import { attachPrimitiveElement } from "./_";
import { attachComponentElement } from "./component/_";
import { Element } from "./element";
import { attachMediaElement } from "./media";
import { attachSlotElement } from "./slot";
import { attachTextElement } from "./text";
import { attachVectorElement } from "./vector";

export function createElement(
  ymap: y.Map<any>,
  component: Component
): Element<any> {
  const type = ymap.get("type") as ElementData["type"];
  switch (type) {
    case "component":
      return attachComponentElement(ymap, component);
    case "container":
      return attachComponentElement(ymap, component);
    case "slot":
      return attachSlotElement(ymap, component);
    case "text":
      return attachTextElement(ymap, component);
    case "vector":
      return attachVectorElement(ymap, component);
    case "media":
      return attachMediaElement(ymap, component);
    case "primitive":
      return attachPrimitiveElement(ymap, component);
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
