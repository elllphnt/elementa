import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { Extendable, setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { attachBaseElement, Element } from "./element";

export type TextElement = Element<TextElementData> & {
  text: ResolvableOrEvaluable<string> | undefined;
  text$: Observable<ResolvableOrEvaluable<string> | undefined>;
};

export function attachTextElement(
  ymap: y.Map<any>,
  component: Component
): TextElement {
  const element = attachBaseElement(ymap, component) as Extendable<TextElement>;
  setModelFields(element, ["text"]);
  return element as TextElement;
}

export function createTextElement(component: Component): TextElement {
  const ymap = new y.Map<any>();
  return attachTextElement(ymap, component);
}
