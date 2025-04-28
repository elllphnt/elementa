import { FragmentData } from "@elllphnt/elementa-base";
import {
  createEnhancedReactiveList,
  Extendable,
  getOrCreateYArray,
  ReactiveList,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
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
    fragment.getOrCreateArray("content") as y.Array<y.Map<any>>,
    component
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
  });

  fragment.allCssStylesheets$ = fragment.content.allCssStylesheets$;

  fragment.cloneIds = (clone: y.Map<any>) => {
    fragment.cloneOwnId(clone);
    fragment.content.cloneIds(getOrCreateYArray(clone, "content"));
  };

  const baseDispose = (fragment as any).dispose?.bind(fragment);
  fragment.dispose = () => {
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
