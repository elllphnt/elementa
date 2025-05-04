import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachBaseElement, Element } from "./element";

export type TextElement = Element<TextElementData> & {
  text: ResolvableOrEvaluable<string> | undefined;
  text$: Observable<ResolvableOrEvaluable<string> | undefined>;
};

export function attachTextElement(
  ymap: y.Map<unknown>,
  fragment: Fragment
): ymap is TextElement {
  ymap.set("type", "text");
  if (!attachBaseElement(ymap as y.Map<unknown>, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as TextElement;
  setModelFields(element, ["text"]);
  return true;
}

export function createTextElement(fragment: Fragment): TextElement {
  const ymap = new y.Map<unknown>();
  if (!attachTextElement(ymap, fragment)) {
    throw new Error("Failed to create TextElement");
  }
  return ymap as TextElement;
}
