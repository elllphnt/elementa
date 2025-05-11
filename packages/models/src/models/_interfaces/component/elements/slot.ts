import { ElementList } from "./_list.js";
import { Element } from "./element.js";

export interface SlotElement extends Element {
  placeholder: ElementList;
}
