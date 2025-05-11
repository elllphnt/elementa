import { SlotElementData } from "@elllphnt/elementa-base";
import { Extendable, getOrCreateYArray } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Fragment } from "../fragment.js";
import { attachElementList, ElementList } from "./_list.js";
import { attachBaseElement, Element } from "./element.js";

export type SlotElement = Element<SlotElementData> & {
  placeholder: ElementList;
};

/**
 * Attach SlotElement behavior to a y.Map
 */
export function attachSlotElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is SlotElement {
  ymap.set("type", "slot");

  if (!attachBaseElement(ymap as Extendable<y.Map<any>>, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as SlotElement;

  const placeholder = getOrCreateYArray(ymap, "placeholder");
  attachElementList(getOrCreateYArray(element, "placeholder"), fragment);
  element.placeholder = placeholder as ElementList;

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

  return true;
}

export function createSlotElement(fragment: Fragment): SlotElement {
  const ymap = new y.Map<any>();
  if (!attachSlotElement(ymap, fragment)) {
    throw new Error("Failed to create SlotElement");
  }
  return ymap as SlotElement;
}
