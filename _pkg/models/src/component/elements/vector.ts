import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { ElementModel, withElementBehavior } from "./element";

export type VectorElementModel = ElementModel<VectorElementData> & {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;

  setContent(content: VectorNodeData[] | undefined): void;
  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach VectorElement behavior to a y.Map
 */
export function withVectorElementBehavior(
  ymap: y.Map<any>,
  component: Component
): VectorElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<VectorElementModel>;

  Object.defineProperty(element, "content", {
    get() {
      return element.value.content;
    },
    set(value) {
      element.set("content", value);
    },
  });

  element.content$ = element.observable$.pipe(
    map((v) => v.content),
    distinctUntilChanged()
  );

  element.setContent = (content: VectorNodeData[] | undefined) => {
    element.set("content", content);
  };

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
  };

  return element as VectorElementModel;
}

/**
 * Create a new local VectorElement
 */
export function createVectorElementModel(
  component: Component
): VectorElementModel {
  const ymap = new y.Map<any>();
  return withVectorElementBehavior(ymap, component);
}
