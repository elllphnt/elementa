import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  getOrCreateYArray,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment.js";
import { attachElementList, ElementList } from "./_list.js";
import { attachBaseElement, Element } from "./element.js";

export type ContainerElement = Element<ContainerElementData> & {
  content: ElementList;

  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;
};

/**
 * Attach ContainerElement behavior to a y.Map
 */
export function attachContainerElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is ContainerElement {
  ymap.set("type", "container");
  if (!attachBaseElement(ymap, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as ContainerElement;

  const content = getOrCreateYArray(ymap, "content");
  attachElementList(getOrCreateYArray(ymap, "content"), fragment);
  element.content = content as ElementList;

  Object.defineProperty(element, "allCssStylesheets", {
    get() {
      return [element.cssStyleSheet, ...element.content.allCssStylesheets];
    },
    configurable: true,
  });
  element.allCssStylesheets$ = combineLatestOrEmpty([
    element.content.allCssStylesheets$,
  ]).pipe(
    map(([childrenSheets]) => [element.cssStyleSheet, ...childrenSheets.flat()])
  );

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
    const contentClone = getOrCreateYArray(clone, "content");
    element.content.cloneIds(contentClone as any);
  };

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    element.content.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(element, attachContainerElement);
  return true;
}

export function createContainerElement(fragment: Fragment): ContainerElement {
  const ymap = new y.Map<any>();
  if (!attachContainerElement(ymap, fragment)) {
    throw new Error("Failed to create ContainerElement");
  }
  return ymap as ContainerElement;
}
