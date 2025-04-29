import { ElementData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachPrimitiveElement } from "./_";
import { attachComponentElement } from "./component/_";
import { Element } from "./element";
import { attachMediaElement } from "./media";
import { attachSlotElement } from "./slot";
import { attachTextElement } from "./text";
import { attachVectorElement } from "./vector";

export function createElement(
  ymap: y.Map<any>,
  fragment: Fragment
): Element<any> {
  const type = ymap.get("type") as ElementData["type"];
  switch (type) {
    case "component":
      return attachComponentElement(ymap, fragment);
    case "container":
      return attachComponentElement(ymap, fragment);
    case "slot":
      return attachSlotElement(ymap, fragment);
    case "text":
      return attachTextElement(ymap, fragment);
    case "vector":
      return attachVectorElement(ymap, fragment);
    case "media":
      return attachMediaElement(ymap, fragment);
    case "primitive":
      return attachPrimitiveElement(ymap, fragment);
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
