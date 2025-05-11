import {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  attachEnhancedReactiveMap,
  combineLatestOrEmpty,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, switchMap, tap } from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../../../_lib/resolvable.js";
import { CssStyleSheet } from "../../../../css/_.js";
import { ModelFile } from "../../../../infrastructure/_.js";
import { Component } from "../../component.js";
import { Fragment } from "../../fragment.js";
import { Identifiable } from "../../identifiable.js";
import { attachBaseElement, Element } from "../element.js";
import { attachSlotFill, createSlotFill, SlotFill } from "./slot_fill.js";

export type ComponentElement = Element<ComponentElementData> & {
  fills: ReactiveMap<Record<string, SlotFill>>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  componentUrl: string | undefined;
  componentUrl$: Observable<string | undefined>;

  absoluteComponentUrl: string | undefined;
  absoluteComponentUrl$: Observable<string | undefined>;

  localComponent: ModelFile<Component> | undefined;
  localComponent$: Observable<ModelFile<Component> | undefined>;

  componentName: string | undefined;
  componentName$: Observable<string | undefined>;

  props: Record<string, any>;
  props$: Observable<Record<string, any>>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  fill(id: string, create?: true): SlotFill;
  fill$(id: string, create?: true): Observable<SlotFill>;

  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;
};

/**
 * Attach ComponentElement behavior to a y.Map
 */
export function attachComponentElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is ComponentElement {
  ymap.set("type", "component");

  if (!attachBaseElement(ymap, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap;
  const componentElement = element as ComponentElement;

  componentElement.fills = attachEnhancedReactiveMap(
    getOrCreateYMap<y.Map<any>>(element, "fills"),
    attachSlotFill,
    (ymap) => attachSlotFill(ymap, fragment)
  );

  setReactiveMapGetters(componentElement, ["componentUrl"]);

  const _props = new ResolvableRecord(
    (componentElement.get("props") as Record<string, any>) ?? {},
    fragment.component.project.infrastructure
  );

  const propsSubscription = _props.subscribe(
    componentElement.observable$.pipe(map((v) => v.props ?? {}))
  );

  Object.defineProperty(componentElement, "allCssStylesheets", {
    get() {
      return [
        ...componentElement.allCssStylesheets,
        ...Object.values([...componentElement.fills.values()]).flatMap(
          (s: SlotFill) => s.allCssStylesheets
        ),
      ];
    },
    configurable: true,
  });

  element.allCssStylesheets$ = combineLatestOrEmpty([
    element.allCssStylesheets$,
    componentElement.fills.observable$.pipe(
      switchMap((slots) =>
        combineLatestOrEmpty(
          Object.values(slots).map((slot) => slot.allCssStylesheets$)
        )
      )
    ),
  ]).pipe(
    map(([selfSheets, slotSheets]) => [...selfSheets, ...slotSheets.flat()])
  );

  Object.defineProperty(componentElement, "absoluteComponentUrl", {
    get() {
      return componentElement.componentUrl
        ? fragment.component.project.absoluteFileUrl(
            componentElement.componentUrl
          )
        : undefined;
    },
  });

  componentElement.absoluteComponentUrl$ = componentElement.componentUrl$.pipe(
    map((url) => {
      return url ? fragment.component.project.absoluteFileUrl(url) : undefined;
    })
  );

  Object.defineProperty(componentElement, "localComponent", {
    get() {
      return componentElement.absoluteComponentUrl
        ? fragment.component.project.infrastructure.component(
            componentElement.absoluteComponentUrl
          )
        : undefined;
    },
  });

  componentElement.localComponent$ =
    componentElement.absoluteComponentUrl$.pipe(
      map((url) => {
        return url
          ? fragment.component.project.infrastructure.component(url)
          : undefined;
      })
    );

  Object.defineProperty(componentElement, "props", {
    get() {
      return _props.value;
    },
  });

  componentElement.props$ = _props.value$;

  componentElement.prop = (key: string) => {
    return componentElement.props[key];
  };

  componentElement.prop$ = (key: string) => {
    return componentElement.props$.pipe(map((props) => props[key]));
  };

  componentElement.setProp = (
    key: string,
    value: ResolvableOrEvaluable<any> | undefined
  ) => {
    const newProps = { ...componentElement.props };
    if (value === undefined) {
      delete newProps[key];
    } else {
      newProps[key] = value;
    }
    element.set("props", newProps);
  };

  componentElement.fill = (id: string, create?: true) => {
    let item = componentElement.fills.get(id);
    if (!item && create) {
      componentElement.fills.set(id, createSlotFill(fragment));
      item = componentElement.fills.get(id);
    }
    return item!;
  };

  componentElement.fill$ = (id: string, create?: true) => {
    return componentElement.fills.observable$.pipe(
      map((fills) => fills[id]),
      tap((item) => {
        if (!item && create) {
          componentElement.fills.set(id, createSlotFill(fragment));
        }
      }),
      filter((item) => !!item || !create)
    ) as any;
  };

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    propsSubscription.unsubscribe();
    _props.dispose();
    componentElement.fills.dispose();
    if (baseDispose) baseDispose();
  };

  componentElement.cloneIds = (clone: y.Map<any>) => {
    componentElement.cloneOwnId(clone);
    const fillsClone = getOrCreateYMap(clone, "fills");
    Identifiable.cloneIdentifiableMapIds(
      Object.fromEntries(componentElement.fills.entries()),
      fillsClone as any
    );
  };

  setEnhancer(element, attachComponentElement);
  return true;
}

/**
 * Create a new local ComponentElement model
 */
export function createComponentElement(fragment: Fragment): ComponentElement {
  const ymap = new y.Map<any>();
  if (!attachComponentElement(ymap, fragment)) {
    throw new Error("Failed to create ComponentElement");
  }
  return ymap as ComponentElement;
}
