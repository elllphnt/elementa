import {
  attachEnhancedReactiveList,
  combineLatestOrEmpty,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { map, Observable, switchMap } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { Fragment } from "../fragment.js";
import { attachBaseElement, Element } from "./element.js";

export interface ElementList {
  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  // List-like methods and props
  toArray(): Element[];
  get(index: number): Element | undefined;
  length: number;
  observable$: Observable<Element[]>;
}

export function attachElementList(
  yarray: y.Array<any>,
  fragment: Fragment
): yarray is ElementList {
  const rxList = attachEnhancedReactiveList(
    yarray,
    attachBaseElement,
    (ymap) => {
      return createElement(ymap, fragment);
    }
  );
  const list = rxList as unknown as ElementList;

  Object.defineProperty(rxList, "allCssStylesheets", {
    get() {
      return [...list.toArray().flatMap((e) => e.allCssStylesheets)];
    },
    configurable: true,
  });
  list.allCssStylesheets$ = list.observable$.pipe(
    switchMap((elements) =>
      combineLatestOrEmpty(
        elements.map((element) => element.allCssStylesheets$)
      )
    ),
    map((sheets) => sheets.flat())
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
