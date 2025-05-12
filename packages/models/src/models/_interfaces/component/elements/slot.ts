import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import { Element } from "./_element.js";

export interface SlotElement extends BaseElement<"slot"> {
  placeholder: Element[];
  placeholder$: Observable<Element[]>;
}
