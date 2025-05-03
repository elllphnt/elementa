import {
  combineLatestOrEmpty,
  createEnhancedReactiveList,
  ReactiveList,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import * as _ from "lodash";
import { map, Observable, switchMap } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "../../css/_";
import { Fragment } from "../fragment";
import { Identifiable } from "../identifiable";
import { createElement } from "./_create";
import { attachBaseElement, Element } from "./element";

export type ElementList = ReactiveList<Element<any>> & {
  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;
  cloneIds(yarray: y.Array<y.Map<any>>): void;
};

export function attachElementList(
  yarray: y.Array<y.Map<any>>,
  fragment: Fragment
): yarray is ElementList {
  const rxList = createEnhancedReactiveList(
    yarray as y.Array<y.Map<any>>,
    attachBaseElement,
    (ymap) => createElement(ymap, fragment)
  );
  const list = rxList as ElementList;

  Object.defineProperty(rxList, "allCssStylesheets", {
    get() {
      return [...rxList.toArray().flatMap((e) => e.allCssStylesheets)];
    },
    configurable: true,
  });
  list.allCssStylesheets$ = rxList.observable$.pipe(
    switchMap((elements) =>
      combineLatestOrEmpty(
        elements.map((element) => element.allCssStylesheets$)
      )
    ),
    map((sheets) => _.flatten(sheets))
  );

  list.cloneIds = (yarray: y.Array<y.Map<any>>) => {
    Identifiable.cloneIdentifiableListIds(list.toArray(), yarray);
  };

  setEnhancer(list, attachElementList);
  return true;
}

export function createElementList(fragment: Fragment): ElementList {
  const yarray = new y.Array<y.Map<any>>();
  if (!attachElementList(yarray, fragment)) {
    throw new Error("Failed to create ElementList");
  }
  return yarray as ElementList;
}
