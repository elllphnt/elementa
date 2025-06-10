import { ResolvableOrEvaluable } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";

export interface TextElement extends BaseElement<"text"> {
  text: ResolvableOrEvaluable<string> | undefined;
  text$: Observable<ResolvableOrEvaluable<string> | undefined>;
}
