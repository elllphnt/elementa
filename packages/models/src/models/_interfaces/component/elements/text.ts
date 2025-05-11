import { ResolvableOrEvaluable } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Element } from "./element.js";

export interface TextElement extends Element {
  text: ResolvableOrEvaluable<string> | undefined;
  text$: Observable<ResolvableOrEvaluable<string> | undefined>;
}
