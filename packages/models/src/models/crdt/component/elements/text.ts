import { TextElementData } from "@elllphnt/elementa-base";
import {
  assert,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Fragment } from "../../../../_.js";
import { TextElement } from "../../../../_interfaces/component/elements/text.js";
import { attachBaseElement } from "./element.js";

export function attachTextElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & TextElement {
  element.set("type", "text");

  assert(attachBaseElement<TextElementData>(element, fragment));
  assert(setReactiveMapGetters(element, ["text"]));

  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<TextElement>(element, attachTextElement);
}
