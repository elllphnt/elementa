import {
  ComponentElementData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  CRDTModelMap,
  Extendable,
  getOrCreateYMap,
  withCRDTModelMapBehavior,
} from "@elllphnt/elementa-utils";
import {
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../../_lib/resolvable";
import { Component } from "../../component";
import { IdentifiableModel } from "../../identifiable";
import { ElementModel, withElementBehavior } from "../element";
import {
  createSlotFillModel,
  SlotFillModel,
  withSlotFillBehavior,
} from "./slot_fill";

export type ComponentElementModel = ElementModel<ComponentElementData> & {
  fills: CRDTModelMap<y.Map<any>, SlotFillModel>;

  allCssStylesheets: any[];
  allCssStylesheets$: Observable<any[]>;

  componentUrl: string | undefined;
  componentUrl$: Observable<string | undefined>;

  absoluteComponentUrl: string | undefined;
  absoluteComponentUrl$: Observable<string | undefined>;

  localComponent: Component | undefined;
  localComponent$: Observable<Component | undefined>;

  componentName: string | undefined;
  componentName$: Observable<string | undefined>;

  props: Record<string, any>;
  props$: Observable<Record<string, any>>;

  prop(key: string): any;
  prop$(key: string): Observable<any>;

  fill(id: string, create?: true): SlotFillModel;
  fill$(id: string, create?: true): Observable<SlotFillModel>;

  setComponentUrl(url: string | undefined): void;
  setProp(key: string, value: ResolvableOrEvaluable<any> | undefined): void;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach ComponentElement behavior to a y.Map
 */
export function withComponentElementBehavior(
  ymap: y.Map<any>,
  component: Component
): ComponentElementModel {
  const element = withElementBehavior(
    ymap,
    component
  ) as Extendable<ComponentElementModel>;

  element.fills = withCRDTModelMapBehavior(
    element.getOrCreateMap("fills") as Extendable<y.Map<y.Map<any>>>,
    (ymap) => withSlotFillBehavior(ymap, component)
  );

  const _props = new ResolvableRecord(
    element.value.props ?? {},
    component.project.infrastructure
  );

  const propsSubscription = _props.subscribe(
    element.observable$.pipe(map((v) => v.props ?? {}))
  );

  Object.defineProperty(element, "allCssStylesheets", {
    get() {
      return [
        ...element.allCssStylesheets,
        ...Object.values(element.fills.items).flatMap(
          (s) => s.allCssStylesheets
        ),
      ];
    },
  });

  element.allCssStylesheets$ = combineLatestOrEmpty([
    element.allCssStylesheets$,
    element.fills.items$.pipe(
      switchMap((slots) =>
        combineLatestOrEmpty(
          Object.values(slots).map((slot) => slot.allCssStylesheets$)
        )
      )
    ),
  ]).pipe(
    map(([selfSheets, slotSheets]) => [...selfSheets, ...slotSheets.flat()])
  );

  Object.defineProperty(element, "componentUrl", {
    get() {
      return element.value.componentUrl;
    },
    set(value) {
      element.set("componentUrl", value);
    },
  });

  element.componentUrl$ = element.observable$.pipe(
    map((v) => v.componentUrl),
    distinctUntilChanged()
  );

  Object.defineProperty(element, "absoluteComponentUrl", {
    get() {
      return element.componentUrl
        ? element.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
            element.component.url,
            element.componentUrl
          )
        : undefined;
    },
  });

  element.absoluteComponentUrl$ = element.componentUrl$.pipe(
    map((url) => {
      return url
        ? element.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
            element.component.url,
            url
          )
        : undefined;
    })
  );

  Object.defineProperty(element, "localComponent", {
    get() {
      return element.absoluteComponentUrl
        ? element.component.project.componentManager.component(
            element.absoluteComponentUrl
          )
        : undefined;
    },
  });

  element.localComponent$ = element.absoluteComponentUrl$.pipe(
    map((url) => {
      return url
        ? element.component.project.componentManager.component(url)
        : undefined;
    })
  );

  Object.defineProperty(element, "componentName", {
    get() {
      return element.localComponent?.name;
    },
  });

  element.componentName$ = element.localComponent$.pipe(
    map((local) => local?.name)
  );

  Object.defineProperty(element, "template", {
    get() {
      return element.localComponent?.template ?? [];
    },
  });

  element.template$ = element.localComponent$.pipe(
    map((local) => local?.template ?? [])
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

  element.setComponentUrl = (url: string | undefined) => {
    element.set("componentUrl", url);
  };

  element.setProp = (
    key: string,
    value: ResolvableOrEvaluable<any> | undefined
  ) => {
    const newProps = { ...element.value.props };
    if (value === undefined) {
      delete newProps[key];
    } else {
      newProps[key] = value;
    }
    element.set("props", newProps);
  };

  element.fill = (id: string, create?: true) => {
    let item = element.fills.get(id);
    if (!item && create) {
      element.fills.set(id, createSlotFillModel(component));
      item = element.fills.get(id);
    }
    return item!;
  };

  element.fill$ = (id: string, create?: true) => {
    return element.fills.item$(id).pipe(
      tap((item) => {
        if (!item && create) {
          element.fills.set(id, createSlotFillModel(component));
        }
      }),
      filter((item) => !!item || !create)
    ) as any;
  };

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    propsSubscription.unsubscribe();
    _props.dispose();
    element.fills.dispose();
    if (baseDispose) baseDispose();
  };

  element.cloneIds = (clone: y.Map<any>) => {
    element.cloneOwnId(clone);
    const fillsClone = getOrCreateYMap(clone, "fills");
    IdentifiableModel.cloneIdentifiableMapIds(
      element.fills.items,
      fillsClone as any
    );
  };

  return element as ComponentElementModel;
}

/**
 * Create a new local ComponentElement model
 */
export function createComponentElementModel(
  component: Component
): ComponentElementModel {
  const ymap = new y.Map<any>();
  return withComponentElementBehavior(ymap, component);
}
