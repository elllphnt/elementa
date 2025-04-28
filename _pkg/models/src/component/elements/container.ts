import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  getOrCreateYArray,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { attachElementList, ElementList } from "./_list";
import { attachBaseElement, Element } from "./element";

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
  component: Component
): ContainerElement {
  const element = attachBaseElement(ymap, component) as ContainerElement;

  element.content = attachElementList(
    getOrCreateYArray(ymap, "content"),
    component
  );

  Object.defineProperty(element, "allCssStylesheets", {
    get() {
      return [element.cssStyleSheet, ...element.content.allCssStylesheets];
    },
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
  return element as ContainerElement;
}

export function createContainerElement(component: Component): ContainerElement {
  const ymap = new y.Map<any>();
  return attachContainerElement(ymap, component);
}
