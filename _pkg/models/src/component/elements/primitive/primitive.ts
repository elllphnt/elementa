import {
  PrimitiveElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  CRDTModelMap,
  Extendable,
  withCRDTModelMapBehavior,
} from "@elllphnt/elementa-utils";
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../../_lib/resolvable";
import { Component } from "../../component";
import { ElementModel, withElementBehavior } from "../element";
import {
  createPrimitiveSubElementModel,
  PrimitiveSubElementModel,
  withPrimitiveSubElementBehavior,
} from "./sub_element";

export type PrimitiveElementModel = ElementModel<PrimitiveElementData> & {
  elements: CRDTModelMap<y.Map<any>, PrimitiveSubElementModel>;

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

  element(name: string, create?: true): PrimitiveSubElementModel;
  element$(name: string, create?: true): Observable<PrimitiveSubElementModel>;

  cloneIds(clone: y.Map<any>): void;
};

export function withPrimitiveElementBehavior(
  ymap: y.Map<any>,
  component: Component
): PrimitiveElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<PrimitiveElementModel>;

  element.elements = withCRDTModelMapBehavior(
    element.getOrCreateMap("elements") as y.Map<y.Map<any>>,
    (ymap) => withPrimitiveSubElementBehavior(ymap, component)
  );

  const _props = new ResolvableRecord(
    element.value.props ?? {},
    component.project.infrastructure
  );

  const propsSubscription = _props.subscribe(
    element.observable$.pipe(map((v) => v.props ?? {}))
  );

  Object.defineProperty(element, "primitiveUrl", {
    get() {
      return element.value.primitiveUrl;
    },
    set(value) {
      element.set("primitiveUrl", value);
    },
  });

  element.primitiveUrl$ = element.observable$.pipe(
    map((v) => v.primitiveUrl),
    distinctUntilChanged()
  );

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

  Object.defineProperty(element, "props", {
    get() {
      return _props.value;
    },
  });

  element.props$ = _props.value$;

  element.prop = (key: string) => {
    return element.props[key];
  };

  element.prop$ = (key: string) => {
    return element.props$.pipe(map((props) => props[key]));
  };

  element.setPrimitiveUrl = (url: string | undefined) => {
    element.set("primitiveUrl", url);
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
    let el = element.elements.item(name);
    if (!el && create) {
      element.elements.set(name, createPrimitiveSubElementModel(component));
      el = element.elements.item(name);
    }
    return el!;
  };

  element.element$ = (name: string, create?: true) => {
    return element.elements.item$(name).pipe(
      tap((el) => {
        if (!el && create) {
          element.elements.set(name, createPrimitiveSubElementModel(component));
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

  return element as PrimitiveElementModel;
}

export function createPrimitiveElementModel(
  component: Component
): PrimitiveElementModel {
  const ymap = new y.Map<any>();
  return withPrimitiveElementBehavior(ymap, component);
}
