import { FragmentData } from "@elllphnt/elementa-base";
import {
  createEnhancedReactiveList,
  Extendable,
  getOrCreateYArray,
  ReactiveList,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, Observable } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "../css/_";
import { Component } from "./component";
import { attachDataInput, DataInput } from "./data_input";
import { attachElementList, ElementList } from "./elements/_list";
import { attachIdentifiable, Identifiable } from "./identifiable";

export enum FragmentVariant {
  Template = "template",
  Fragment = "fragment",
}

export type Fragment = Identifiable<FragmentData> & {
  component: Component;
  variant: FragmentVariant;

  content: ElementList;
  params: ReactiveList<DataInput>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  slotIds: string[];
  slotIds$: Observable<string[]>;

  registerSlotId: (id: string) => void;
  unregisterSlotId: (id: string) => void;
};

/**
 * Attach Fragment behavior to a y.Map
 */
export function attachFragment(
  ymap: y.Map<any>,
  component: Component,
  variant: FragmentVariant = FragmentVariant.Fragment
): Fragment {
  const fragment = attachIdentifiable<FragmentData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<Fragment>;

  fragment.component = component;
  fragment.variant = variant;

  fragment.content = attachElementList(
    getOrCreateYArray(ymap, "content"),
    fragment
  );

  fragment.params = createEnhancedReactiveList(
    getOrCreateYArray<y.Map<any>>(ymap, "params"),
    attachDataInput,
    (ymap) => attachDataInput(ymap, component)
  );

  Object.defineProperty(fragment, "allCssStylesheets", {
    get() {
      return fragment.content.allCssStylesheets;
    },
    configurable: true,
  });

  fragment.allCssStylesheets$ = fragment.content.allCssStylesheets$;

  // --- Slot Registry ---

  const slotIdSet = new Set<string>();
  const _slotIds$ = new BehaviorSubject<string[]>([]);

  fragment.slotIds$ = _slotIds$.asObservable();
  Object.defineProperty(fragment, "slotIds", {
    get() {
      return _slotIds$.value;
    },
  });

  fragment.registerSlotId = (id: string) => {
    if (!slotIdSet.has(id)) {
      slotIdSet.add(id);
      _slotIds$.next(Array.from(slotIdSet));
    }
  };

  fragment.unregisterSlotId = (id: string) => {
    if (slotIdSet.delete(id)) {
      _slotIds$.next(Array.from(slotIdSet));
    }
  };

  // --- Disposal ---
  const baseDispose = (fragment as any).dispose?.bind(fragment);
  fragment.dispose = () => {
    _slotIds$.complete();
    fragment.content.dispose();
    fragment.params.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(fragment, attachFragment);
  return fragment as Fragment;
}

/**
 * Create a new local Fragment
 */
export function createFragment(
  component: Component,
  variant: FragmentVariant = FragmentVariant.Fragment
): Fragment {
  const ymap = new y.Map<any>();
  return attachFragment(ymap, component, variant);
}
