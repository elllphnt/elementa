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
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../css/_";
import { attachStylesheet } from "../../style/stylesheet";
import { Fragment } from "../fragment";
import { attachIdentifiable, Identifiable } from "../identifiable";

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
): Element<D> {
  const identifiable = attachIdentifiable<BaseElementData>(ymap);
  const element = identifiable as unknown as Element<D>;

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

  element.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `${element.type}:${element.key}`,
    stylesheet: attachStylesheet(
      getOrCreateYMap(element, "stylesheet"),
      fragment.component.project
    ),
  });

  setModelFields(element, [
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
  return element;
}
