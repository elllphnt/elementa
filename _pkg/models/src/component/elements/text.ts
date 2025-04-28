import {
  ResolvableOrEvaluable,
  TextElementData,
} from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { ElementModel, withElementBehavior } from "./element";

export type TextElementModel = ElementModel<TextElementData> & {
  text: ResolvableOrEvaluable<string> | undefined;
  text$: Observable<ResolvableOrEvaluable<string> | undefined>;

  setText(text: ResolvableOrEvaluable<string> | undefined): void;
  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach TextElement behavior to a y.Map
 */
export function withTextElementBehavior(
  ymap: y.Map<any>,
  component: Component
): TextElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<TextElementModel>;

  Object.defineProperty(element, "text", {
    get() {
      return element.value.text;
    },
    set(value) {
      element.set("text", value);
    },
  });

  element.text$ = element.observable$.pipe(
    map((v) => v.text),
    distinctUntilChanged()
  );

  element.setText = (text: string | undefined) => {
    element.set("text", text);
  };

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
  };

  return element as TextElementModel;
}

/**
 * Create a new local TextElement
 */
export function createTextElementModel(component: Component): TextElementModel {
  const ymap = new y.Map<any>();
  return withTextElementBehavior(ymap, component);
}
