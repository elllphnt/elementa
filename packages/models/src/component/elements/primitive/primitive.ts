import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  createEnhancedReactiveMap,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../../_lib/resolvable.js";
import { File } from "../../../infrastructure/file/file.js";
import { Fragment } from "../../fragment.js";
import { attachElementList, ElementList } from "../_list.js";
import { attachBaseElement, Element } from "../element.js";
import {
  attachPrimitiveSubElement,
  createPrimitiveSubElement,
  PrimitiveSubElement,
} from "./sub_element.js";

export type PrimitiveElement = Element<PrimitiveElementData> & {
  content: ElementList;
  elements: ReactiveMap<Record<string, PrimitiveSubElement>>;

  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;

  primitiveUrl: string | undefined;
  primitiveUrl$: Observable<string | undefined>;

  primitiveAbsoluteUrl: string | undefined;
  primitiveAbsoluteUrl$: Observable<string | undefined>;

  primitiveFile: File | undefined;
  primitiveFile$: Observable<File | undefined>;

  props: Record<string, any>;
  props$: Observable<Record<string, any>>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  setPrimitiveUrl(url: string | undefined): void;
  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;

  element(name: string, create?: true): PrimitiveSubElement;
  element$(name: string, create?: true): Observable<PrimitiveSubElement>;

  cloneIds(clone: y.Map<any>): void;
};

export function attachPrimitiveElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is PrimitiveElement {
  ymap.set("type", "primitive");
  if (!attachBaseElement(ymap, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as PrimitiveElement;

  const content = getOrCreateYArray(ymap, "content");
  attachElementList(getOrCreateYArray(ymap, "content"), fragment);
  element.content = content as ElementList;

  element.elements = createEnhancedReactiveMap(
    getOrCreateYMap<y.Map<any>>(element, "elements"),
    attachPrimitiveSubElement,
    (ymap) => attachPrimitiveSubElement(ymap, fragment)
  );

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

  const _props = new ResolvableRecord(
    element.props ?? {},
    fragment.component.project.infrastructure
  );

  const propsSubscription = _props.subscribe(
    element.observable$.pipe(map((v) => v.props ?? {}))
  );

  setModelFields(element, ["primitiveUrl", "props"]);

  Object.defineProperty(element, "absoluteModuleUrl", {
    get() {
      return element.primitiveUrl
        ? fragment.component.project.absoluteFileUrl(element.primitiveUrl)
        : undefined;
    },
  });

  element.primitiveAbsoluteUrl$ = element.primitiveUrl$.pipe(
    map((url) => {
      return url ? fragment.component.project.absoluteFileUrl(url) : undefined;
    })
  );

  element.prop = (key: string) => {
    return element.props[key];
  };

  element.prop$ = (key: string) => {
    return element.props$.pipe(map((props) => props[key]));
  };

  element.setProp = (
    key: string,
    value: ResolvableOrEvaluable<any> | undefined
  ) => {
    const props = { ...element.get("props") };
    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }
    element.set("props", props);
  };

  element.element = (name: string, create?: true) => {
    let el = element.elements.get(name);
    if (!el && create) {
      element.elements.set(name, createPrimitiveSubElement(fragment));
      el = element.elements.get(name);
    }
    return el!;
  };

  element.element$ = (name: string, create?: true) => {
    return element.elements.observable$.pipe(
      map((elements) => elements[name]),
      tap((el) => {
        if (!el && create) {
          element.elements.set(name, createPrimitiveSubElement(fragment));
        }
      }),
      filter((el) => !!el || !create)
    ) as any;
  };

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    propsSubscription.unsubscribe();
    _props.dispose();
    element.elements.dispose();
    if (baseDispose) baseDispose();
  };

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
  };

  setEnhancer(element, attachPrimitiveElement);
  return true;
}

export function createPrimitiveElement(fragment: Fragment): PrimitiveElement {
  const ymap = new y.Map<any>();
  if (!attachPrimitiveElement(ymap, fragment)) {
    throw new Error("Failed to create PrimitiveElement");
  }
  return ymap as PrimitiveElement;
}
