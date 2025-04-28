import {
  attachListOfReactives,
  combineLatestOrEmpty,
  Extendable,
  ReactiveListOf,
} from "@elllphnt/elementa-utils";
import * as _ from "lodash";
import { map, Observable, switchMap } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { IdentifiableModel } from "../identifiable";
import { createElement } from "./_create";
import { ElementModel } from "./element";

export type ElementListModel = ReactiveListOf<y.Map<any>, ElementModel<any>> & {
  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;

  cloneIds(yarray: y.Array<y.Map<any>>): void;
};

/**
 * Attach ElementList behavior to a y.Array
 */
export function withElementListBehavior(
  yarray: y.Array<y.Map<any>>,
  component: Component
): ElementListModel {
  const list = attachListOfReactives(
    yarray as Extendable<y.Array<y.Map<any>>>,
    (ymap) => createElement(ymap, component)
  ) as Extendable<ElementListModel>;

  // allCssStylesheets (live computed field)
  Object.defineProperty(list, "allCssStylesheets", {
    get() {
      return [...list.items.flatMap((e) => e.allCssStylesheets)];
    },
  });

  list.allCssStylesheets$ = list.items$.pipe(
    switchMap((elements) =>
      combineLatestOrEmpty(
        elements.map((element) => element.allCssStylesheets$)
      )
    ),
    map((sheets) => _.flatten(sheets))
  );

  // Clone IDs across array
  list.cloneIds = (yarray: y.Array<y.Map<any>>) => {
    IdentifiableModel.cloneIdentifiableListIds(list.items, yarray);
  };

  return list as ElementListModel;
}

/**
 * Create a new local ElementList model
 */
export function createElementListModel(component: Component): ElementListModel {
  const yarray = new y.Array<y.Map<any>>();
  return withElementListBehavior(yarray, component);
}
