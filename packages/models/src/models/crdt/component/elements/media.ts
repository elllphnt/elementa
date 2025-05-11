import { MediaElementData } from "@elllphnt/elementa-base";
import {
  assert,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Fragment } from "../../../_interfaces/_.js";
import { MediaElement } from "../../../_interfaces/component/elements/media.js";
import { attachBaseElement } from "./element.js";

export function attachMediaElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & MediaElement {
  element.set("type", "media");

  assert(attachBaseElement<MediaElementData>(element, fragment));
  assert(setReactiveMapGetters(element, ["media", "fit", "position"]));

  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<MediaElement>(element, attachMediaElement);
}
