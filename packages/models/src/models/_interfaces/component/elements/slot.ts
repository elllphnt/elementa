import { Observable } from "rxjs";
import { Element } from "./element.js";

export interface SlotElement extends Element {
  placeholder: Element[];
  placeholder$: Observable<Element[]>;
}
