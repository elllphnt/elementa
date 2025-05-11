import { Observable } from "rxjs";
import { Element } from "./element.js";

export interface ContainerElement extends Element {
  content: Element[];
  content$: Observable<Element[]>;
}
