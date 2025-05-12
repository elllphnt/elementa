import {
  assert,
  attachEnhancedReactiveList,
  getOrCreateYArray,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { BaseElement, Fragment } from "../../../_interfaces/_.js";
import { SlotElement } from "../../../_interfaces/component/elements/slot.js";
import { attachElement } from "./_create.js";
import { attachBaseElement } from "./element.js";

export function attachSlotElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & SlotElement {
  element.set("type", "slot");

  assert(attachBaseElement(element, fragment));

  const content = getOrCreateYArray(element, "placeholder");
  assert(
    attachEnhancedReactiveList<BaseElement>(content, attachElement, (ymap) =>
      attachElement(ymap, fragment)
    )
  );
  assert(setObjectGetter(element, "placeholder", () => content.items));
  assert(setObjectProperty(element, "placeholder$", content.items$));

  // --- Slot registration at runtime ---
  fragment.registerSlotId(element.id);

  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    fragment.unregisterSlotId(element.id); // Unregister on disposal
    (element.placeholder as any).dispose?.();
    baseDispose?.();
  };

  return setEnhancer<SlotElement>(element, attachSlotElement);
}
