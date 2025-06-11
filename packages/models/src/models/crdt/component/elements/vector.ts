import { VectorElementData } from "@elllphnt/elementa-base";
import {
  assert,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Fragment } from "../../../../_.js";
import { VectorElement } from "../../../../_interfaces/component/elements/vector.js";
import { attachBaseElement } from "./element.js";

export function attachVectorElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & VectorElement {
  element.set("type", "vector");

  assert(attachBaseElement<VectorElementData>(element, fragment));
  assert(setReactiveMapGetters(element, ["content"]));

  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<VectorElement>(element, attachVectorElement);
}
