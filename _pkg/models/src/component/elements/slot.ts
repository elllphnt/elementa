import { SlotElementData } from "@elllphnt/elementa-base";
import { Extendable, getOrCreateYArray } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../component";
import { attachElementList, ElementList } from "./_list";
import { attachBaseElement, Element } from "./element";

export type SlotElement = Element<SlotElementData> & {
  placeholder: ElementList;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach SlotElement behavior to a y.Map
 */
export function attachSlotElement(
  ymap: y.Map<any>,
  component: Component
): SlotElement {
  const element = attachBaseElement(ymap, component) as Extendable<SlotElement>;

  element.placeholder = attachElementList(
    getOrCreateYArray(element, "placeholder"),
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

  return element as SlotElement;
}

export function createSlotElement(component: Component): SlotElement {
  const ymap = new y.Map<any>();
  return attachSlotElement(ymap, component);
}
