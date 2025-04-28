import {
  BaseElementData,
  ElementData,
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable, of } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../css/_";
import { Stylesheet } from "../../style/stylesheet";
import { Component } from "../component";
import { attachIdentifiable } from "../identifiable";

export type ElementModel<D extends BaseElementData> = ReturnType<
  typeof attachIdentifiable<D>
> & {
  component: Component;
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

  setLink(link: LinkData | undefined): void;
  setName(name: string): void;
  setTag(tag: string): void;
  setRepeat(repeat: ElementRepeatData): void;
  setCondition(condition: Evaluable<boolean>): void;
  setInteraction(key: string, interaction: Expression): void;
  clearInteractions(): void;
  setAriaLabel(label: ResolvableOrEvaluable<string>): void;
  setAriaHidden(hidden: ResolvableOrEvaluable<boolean>): void;
  setAriaRole(role: ResolvableOrEvaluable<string>): void;
  setTabIndex(tabIndex: ResolvableOrEvaluable<number>): void;
};

/**
 * Attach Element behavior to a y.Map
 */
export function withElementBehavior<D extends BaseElementData>(
  ymap: y.Map<any>,
  component: Component
): ElementModel<D> {
  const element = attachIdentifiable<BaseElementData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ElementModel<D>>;

  element.component = component;

  element.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `${element.value.type}:${element.id}`,
    stylesheet: new Stylesheet(
      element.getOrCreateMap("stylesheet"),
      component.project
    ),
  });

  // Native computed fields
  Object.defineProperty(element, "allCssStylesheets", {
    get() {
      return [element.cssStyleSheet];
    },
  });

  element.allCssStylesheets$ = of([element.cssStyleSheet]);

  Object.defineProperty(element, "type", {
    get() {
      return element.value.type;
    },
  });

  // Field mappings
  const fields = [
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
  ] as const;

  for (const field of fields) {
    Object.defineProperty(element, field, {
      get() {
        return element.value[field];
      },
      set(value) {
        element.set(field, value);
      },
    });

    (element as any)[`${field}$`] = element.observable$.pipe(
      map((v) => v[field]),
      distinctUntilChanged()
    );
  }

  // Methods
  element.setLink = (link: LinkData | undefined) => {
    element.set("link", link as any);
  };

  element.setName = (name: string) => {
    element.set("name", name as any);
  };

  element.setTag = (tag: string) => {
    element.set("tag", tag as any);
  };

  element.setRepeat = (repeat: ElementRepeatData) => {
    element.set("repeat", repeat as any);
  };

  element.setCondition = (condition: Evaluable<boolean>) => {
    element.set("condition", condition as any);
  };

  element.setInteraction = (key: string, interaction: Expression) => {
    const interactions = { ...(element.interactions ?? {}) };
    interactions[key] = interaction;
    element.set("interactions", interactions as any);
  };

  element.clearInteractions = () => {
    element.set("interactions", {} as any);
  };

  element.setAriaLabel = (ariaLabel: ResolvableOrEvaluable<string>) => {
    element.set("ariaLabel", ariaLabel as any);
  };

  element.setAriaHidden = (ariaHidden: ResolvableOrEvaluable<boolean>) => {
    element.set("ariaHidden", ariaHidden as any);
  };

  element.setAriaRole = (ariaRole: ResolvableOrEvaluable<string>) => {
    element.set("ariaRole", ariaRole as any);
  };

  element.setTabIndex = (tabIndex: ResolvableOrEvaluable<number>) => {
    element.set("tabIndex", tabIndex as any);
  };

  const baseDispose = (element as any).dispose?.bind(element);
  element.dispose = () => {
    element.cssStyleSheet.dispose();
    if (baseDispose) baseDispose();
  };

  return element as any;
}

/**
 * Create a new local Element model
 */
export function createElementModel<D extends ElementData>(
  component: Component
): ElementModel<D> {
  const ymap = new y.Map<any>();
  return withElementBehavior(ymap, component);
}
