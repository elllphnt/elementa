import { SlotElementData } from "@elllphnt/elementa-base";
import { Extendable, getOrCreateYArray } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachElementList, ElementList } from "./_list";
import { attachBaseElement, Element } from "./element";

export type SlotElement = Element<SlotElementData> & {
  placeholder: ElementList;
};

/**
 * Attach SlotElement behavior to a y.Map
 */
export function attachSlotElement(
  ymap: y.Map<any>,
  fragment: Fragment
): SlotElement {
  ymap.set("type", "slot");

  const element = attachBaseElement(ymap, fragment) as Extendable<SlotElement>;

  element.placeholder = attachElementList(
    getOrCreateYArray(element, "placeholder"),
    fragment
  );

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
    element.placeholder.cloneIds(getOrCreateYArray(clone, "placeholder"));
  };

  // --- Slot registration at runtime ---
  fragment.registerSlotId(element.id);

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    fragment.unregisterSlotId(element.id); // Unregister on disposal
    element.placeholder.dispose();
    if (baseDispose) baseDispose();
  };

  return element as SlotElement;
}

export function createSlotElement(fragment: Fragment): SlotElement {
  const ymap = new y.Map<any>();
  return attachSlotElement(ymap, fragment);
}
