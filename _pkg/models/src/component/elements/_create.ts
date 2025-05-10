import { ElementData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Fragment } from "../fragment.js";
import { attachContainerElement, attachPrimitiveElement } from "./_.js";
import { attachComponentElement } from "./component/_.js";
import { Element } from "./element.js";
import { attachMediaElement } from "./media.js";
import { attachSlotElement } from "./slot.js";
import { attachTextElement } from "./text.js";
import { attachVectorElement } from "./vector.js";

export function createElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is Element {
  const type = ymap.get("type") as ElementData["type"];
  switch (type) {
    case "component":
      return attachComponentElement(ymap, fragment);
    case "container":
      return attachContainerElement(ymap, fragment);
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
