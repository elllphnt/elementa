import { FragmentData } from "@elllphnt/elementa-base";
import {
  Extendable,
  getOrCreateYArray,
  ReactiveListOf,
  withIdentifiableModelBehavior,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { CssStyleSheet } from "../css/_";
import { Component } from "./component";
import { DataInputModel, withDataInputBehavior } from "./data_input";
import { ElementListModel, withElementListBehavior } from "./elements/_list";

export enum FragmentVariant {
  Template = "template",
  Fragment = "fragment",
}

export type FragmentModel = ReturnType<
  typeof withIdentifiableModelBehavior<FragmentData>
> & {
  component: Component;
  variant: FragmentVariant;

  content: ElementListModel;
  params: ReactiveListOf<y.Map<any>, DataInputModel>;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: ReturnType<ElementListModel["allCssStylesheets$"]>;

  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach Fragment behavior to a y.Map
 */
export function withFragmentBehavior(
  ymap: y.Map<any>,
  component: Component,
  variant: FragmentVariant = FragmentVariant.Fragment
): FragmentModel {
  const fragment = withIdentifiableModelBehavior<FragmentData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<FragmentModel>;

  fragment.component = component;
  fragment.variant = variant;

  fragment.content = withElementListBehavior(
    fragment.getOrCreateArray("content") as y.Array<y.Map<any>>,
    component
  );

  fragment.params = new CRDTModelList(
    fragment.getOrCreateArray("params"),
    (ymap) => withDataInputBehavior(ymap, component)
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

  return fragment as FragmentModel;
}

/**
 * Create a new local Fragment
 */
export function createFragmentModel(
  component: Component,
  variant: FragmentVariant = FragmentVariant.Fragment
): FragmentModel {
  const ymap = new y.Map<any>();
  return withFragmentBehavior(ymap, component, variant);
}
