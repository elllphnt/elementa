import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import { Element } from "./_element.js";

export interface ContainerElement extends BaseElement<"container"> {
  content: Element[];
  content$: Observable<Element[]>;
}
