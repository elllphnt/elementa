import { ContainerElementData } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  Extendable,
  getOrCreateYArray,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { ElementListModel, withElementListBehavior } from "./_list";
import { ElementModel, withElementBehavior } from "./element";

export type ContainerElementModel = ElementModel<ContainerElementData> & {
  content: ElementListModel;

  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach ContainerElement behavior to a y.Map
 */
export function withContainerElementBehavior(
  ymap: y.Map<any>,
  component: Component
): ContainerElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<ContainerElementModel>;

  element.content = withElementListBehavior(
    element.getOrCreateArray("content") as y.Array<y.Map<any>>,
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

  return element as ContainerElementModel;
}

/**
 * Create a new local ContainerElement
 */
export function createContainerElementModel(
  component: Component
): ContainerElementModel {
  const ymap = new y.Map<any>();
  return withContainerElementBehavior(ymap, component);
}
