import {
  assert,
  attachEnhancedReactiveList,
  combineLatestOrEmpty,
  getOrCreateYArray,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { map } from "rxjs";
import * as y from "yjs";
import { BaseElement, Fragment } from "../../../../_.js";
import { ContainerElement } from "../../../../_interfaces/component/elements/container.js";
import { attachElement } from "./_create.js";
import { attachBaseElement } from "./element.js";

export function attachContainerElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & ContainerElement {
  element.set("type", "container");

  assert(attachBaseElement(element, fragment));

  const content = getOrCreateYArray(element, "content");
  assert(
    attachEnhancedReactiveList<BaseElement>(content, attachElement, (ymap) =>
      attachElement(ymap, fragment)
    )
  );
  assert(setObjectGetter(element, "content", () => content.items));
  assert(setObjectProperty(element, "content$", content.items$));

  assert(
    setObjectGetter(element, "allCssStylesheets", () => [
      element.cssStyleSheet,
      ...element.content.flatMap((s) => s.allCssStylesheets),
    ])
  );

  assert(
    setObjectProperty(
      element,
      "allCssStylesheets$",
      combineLatestOrEmpty([
        element.content$.pipe(
          map((children) => children.map((child) => child.allCssStylesheets$))
        ),
      ]).pipe(
        map(([childrenSheets]) => [
          element.cssStyleSheet,
          ...childrenSheets.flat(),
        ])
      )
    )
  );

  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    (element.content as any).dispose?.();
    baseDispose?.();
  };

  return setEnhancer<ContainerElement>(element, attachContainerElement);
}
