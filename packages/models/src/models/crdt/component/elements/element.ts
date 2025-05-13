import { ElementData } from "@elllphnt/elementa-base";
import {
  assert,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { of } from "rxjs";
import * as y from "yjs";
import { StylesheetCssStyleSheet } from "../../../../css/_.js";
import { Fragment } from "../../../_interfaces/_.js";
import { BaseElement } from "../../../_interfaces/component/elements/_base.js";
import { Identifiable } from "../../../_interfaces/component/identifiable.js";
import { attachStylesheet } from "../../style/stylesheet.js";
import { attachIdentifiable } from "../identifiable.js";

export function attachBaseElement<E extends ElementData>(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & ReactiveMap<E> & Identifiable & BaseElement {
  assert(attachIdentifiable<E>(element));
  assert(setObjectProperty(element, "fragment", fragment));

  // Reactive getters
  assert(
    setReactiveMapGetters(element, [
      "name",
      "tag",
      "repeat",
      "condition",
      "interactions",
      "link",
      "ariaLabel",
      "ariaHidden",
      "ariaRole",
      "tabIndex",
    ])
  );

  // Type
  assert(setObjectGetter(element, "type", () => element.get("type")));

  // Stylesheet
  const stylesheet = getOrCreateYMap(element, "stylesheet");
  assert(attachStylesheet(stylesheet, fragment.component.file));

  const cssStyleSheet = new StylesheetCssStyleSheet({
    target: `${(element as any).type}:${(element as any).key}`,
    stylesheet,
  });

  assert(setObjectProperty(element, "cssStyleSheet", cssStyleSheet));
  assert(setObjectGetter(element, "allCssStylesheets", () => [cssStyleSheet]));
  assert(setObjectProperty(element, "allCssStylesheets$", of([cssStyleSheet])));

  // Cleanup
  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    cssStyleSheet.dispose?.();
    baseDispose?.();
  };

  return setEnhancer<BaseElement>(element, attachBaseElement);
}
