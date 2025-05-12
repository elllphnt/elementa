import { ElementData } from "@elllphnt/elementa-base";
import * as y from "yjs";
import { Fragment } from "../../../_interfaces/_.js";
import { BaseElement } from "../../../_interfaces/component/elements/_base.js";
import { attachComponentElement } from "./component/_.js";
import { attachContainerElement } from "./container.js";
import { attachMediaElement } from "./media.js";
import { attachPrimitiveElement } from "./primitive/primitive.js";
import { attachSlotElement } from "./slot.js";
import { attachTextElement } from "./text.js";
import { attachVectorElement } from "./vector.js";

export function attachElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & BaseElement {
  const type = element.get("type") as ElementData["type"];
  switch (type) {
    case "component":
      return attachComponentElement(element, fragment);
    case "container":
      return attachContainerElement(element, fragment);
    case "slot":
      return attachSlotElement(element, fragment);
    case "text":
      return attachTextElement(element, fragment);
    case "vector":
      return attachVectorElement(element, fragment);
    case "media":
      return attachMediaElement(element, fragment);
    case "primitive":
      return attachPrimitiveElement(element, fragment);
    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}
