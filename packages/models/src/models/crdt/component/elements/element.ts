import {
  BaseElementData,
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  getOrCreateYMap,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../../css/_.js";
import { attachStylesheet } from "../../style/stylesheet.js";
import { Fragment } from "../fragment.js";
import { attachIdentifiable, Identifiable } from "../identifiable.js";

export type Element<D extends BaseElementData = BaseElementData> =
  Identifiable<D> & {
    fragment: Fragment;
    cssStyleSheet: StylesheetCssStyleSheet;

    allCssStylesheets: CssStyleSheet[];
    allCssStylesheets$: Observable<CssStyleSheet[]>;

    type: string;

    name: string | undefined;
    name$: Observable<string | undefined>;

    tag: string | undefined;
    tag$: Observable<string | undefined>;

    repeat: ElementRepeatData | undefined;
    repeat$: Observable<ElementRepeatData | undefined>;

    condition: Evaluable<boolean> | undefined;
    condition$: Observable<Evaluable<boolean> | undefined>;

    interactions: Record<string, Expression> | undefined;
    interactions$: Observable<Record<string, Expression> | undefined>;

    link: LinkData | undefined;
    link$: Observable<LinkData | undefined>;

    ariaLabel: ResolvableOrEvaluable<string> | undefined;
    ariaLabel$: Observable<ResolvableOrEvaluable<string> | undefined>;

    ariaHidden: ResolvableOrEvaluable<boolean> | undefined;
    ariaHidden$: Observable<ResolvableOrEvaluable<boolean> | undefined>;

    ariaRole: ResolvableOrEvaluable<string> | undefined;
    ariaRole$: Observable<ResolvableOrEvaluable<string> | undefined>;

    tabIndex: ResolvableOrEvaluable<number> | undefined;
    tabIndex$: Observable<ResolvableOrEvaluable<number> | undefined>;
  };

export function attachBaseElement<D extends BaseElementData>(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is Element<D> {
  if (!attachIdentifiable<BaseElementData>(ymap)) {
    throw Error("Failed to attach identifiable");
  }
  const identifiable = ymap;
  const element = identifiable as any as Element<D>;

  element.fragment = fragment;

  Object.defineProperty(identifiable, "allCssStylesheets", {
    get() {
      return [element.cssStyleSheet];
    },
    configurable: true,
  });
  element.allCssStylesheets$ = of([element.cssStyleSheet]);

  Object.defineProperty(element, "type", {
    get() {
      return element.get("type");
    },
  });

  const stylesheet = getOrCreateYMap(element, "stylesheet");
  if (!attachStylesheet(stylesheet, fragment.component.project)) {
    throw Error("Failed to attach stylesheet");
  }
  element.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `${element.type}:${element.key}`,
    stylesheet,
  });

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
  ]);

  const baseDispose = element.dispose.bind(element);
  element.dispose = () => {
    element.cssStyleSheet.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(element, attachBaseElement);
  return true;
}
