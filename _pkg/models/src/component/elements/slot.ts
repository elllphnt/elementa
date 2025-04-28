import { SlotElementData } from "@elllphnt/elementa-base";
import { Extendable, getOrCreateYArray } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../component";
import { ElementListModel, withElementListBehavior } from "./_list";
import { ElementModel, withElementBehavior } from "./element";

export type SlotElementModel = ElementModel<SlotElementData> & {
  placeholder: ElementListModel;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach SlotElement behavior to a y.Map
 */
export function withSlotElementBehavior(
  ymap: y.Map<any>,
  component: Component
): SlotElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<SlotElementModel>;

  element.placeholder = withElementListBehavior(
    element.getOrCreateArray("placeholder") as y.Array<y.Map<any>>,
    component
  );

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
    element.placeholder.cloneIds(getOrCreateYArray(clone, "placeholder"));
  };

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    element.placeholder.dispose();
    if (baseDispose) baseDispose();
  };

  return element as SlotElementModel;
}

/**
 * Create a new local SlotElement
 */
export function createSlotElementModel(component: Component): SlotElementModel {
  const ymap = new y.Map<any>();
  return withSlotElementBehavior(ymap, component);
}
