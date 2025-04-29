import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  createEnhancedReactiveMap,
  Extendable,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, of, switchMap, tap } from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../../_lib/resolvable";
import { Component } from "../../component";
import { attachBaseElement, Element } from "../element";
import {
  attachPrimitiveSubElement,
  createPrimitiveSubElement,
  PrimitiveSubElement,
} from "./sub_element";

export type PrimitiveElement = Element<PrimitiveElementData> & {
  elements: ReactiveMap<Record<string, PrimitiveSubElement>>;

  primitiveUrl: string | undefined;
  primitiveUrl$: Observable<string | undefined>;

  absoluteModuleUrl: string | undefined;
  absoluteModuleUrl$: Observable<string | undefined>;

  moduleName: string | undefined;
  moduleName$: Observable<string | undefined>;

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
  component: Component
): PrimitiveElement {
  ymap.set("type", "primitive");
  const element = attachBaseElement(
    ymap,
    component
  ) as Extendable<PrimitiveElement>;

  element.elements = createEnhancedReactiveMap(
    getOrCreateYMap<y.Map<any>>(element, "elements"),
    attachPrimitiveSubElement,
    (ymap) => attachPrimitiveSubElement(ymap, component)
  );

  const _props = new ResolvableRecord(
    element.props ?? {},
    component.project.infrastructure
  );

  const propsSubscription = _props.subscribe(
    element.observable$.pipe(map((v) => v.props ?? {}))
  );

  setModelFields(element, ["primitiveUrl", "props"]);

  Object.defineProperty(element, "absoluteModuleUrl", {
    get() {
      return element.primitiveUrl
        ? element.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
            element.component.url,
            element.primitiveUrl
          )
        : undefined;
    },
  });

  element.absoluteModuleUrl$ = element.primitiveUrl$.pipe(
    map((url) => {
      return url
        ? element.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
            element.component.url,
            url
          )
        : undefined;
    })
  );

  Object.defineProperty(element, "moduleName", {
    get() {
      return element.absoluteModuleUrl
        ? element.component.project.infrastructure.fileSystem.fileName(
            element.absoluteModuleUrl
          )
        : undefined;
    },
  });

  element.moduleName$ = element.absoluteModuleUrl$.pipe(
    switchMap((url) => {
      return url
        ? element.component.project.infrastructure.fileSystem.fileName$(url)
        : of(undefined);
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
    const props = { ...element.value.props };
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
      element.elements.set(name, createPrimitiveSubElement(component));
      el = element.elements.get(name);
    }
    return el!;
  };

  element.element$ = (name: string, create?: true) => {
    return element.elements.observable$.pipe(
      map((elements) => elements[name]),
      tap((el) => {
        if (!el && create) {
          element.elements.set(name, createPrimitiveSubElement(component));
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
  return element as PrimitiveElement;
}

export function createPrimitiveElement(component: Component): PrimitiveElement {
  const ymap = new y.Map<any>();
  return attachPrimitiveElement(ymap, component);
}
