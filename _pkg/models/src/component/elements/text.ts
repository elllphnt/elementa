import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { Extendable, setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachBaseElement, Element } from "./element";

export type TextElement = Element<TextElementData> & {
  text: ResolvableOrEvaluable<string> | undefined;
  text$: Observable<ResolvableOrEvaluable<string> | undefined>;
};

export function attachTextElement(
  ymap: y.Map<any>,
  fragment: Fragment
): TextElement {
  ymap.set("type", "text");
  const element = attachBaseElement(ymap, fragment) as Extendable<TextElement>;
  setModelFields(element, ["text"]);
  return element as TextElement;
}

export function createTextElement(fragment: Fragment): TextElement {
  const ymap = new y.Map<any>();
  return attachTextElement(ymap, fragment);
}
