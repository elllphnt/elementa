import { Expression, PrimitiveSubElementData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  getOrCreateYMap,
  ReactiveMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { StylesheetCssStyleSheet } from "../../../css/_";
import { attachStylesheet } from "../../../style/stylesheet";
import { Component } from "../../component";
import { Fragment } from "../../fragment";

export type PrimitiveSubElement = ReactiveMap<PrimitiveSubElementData> & {
  component: Component;
  cssStyleSheet: StylesheetCssStyleSheet;

  interactions: Record<string, Expression>;
  interactions$: Observable<Record<string, Expression>>;

  interaction(event: string): Expression | undefined;
  interaction$(event: string): Observable<Expression | undefined>;

  setInteraction(event: string, interaction: Expression): void;
  clearInteractions(): void;
};

export function attachPrimitiveSubElement(
  ymap: y.Map<unknown>,
  fragment: Fragment
): ymap is PrimitiveSubElement {
  if (!attachReactiveMap(ymap)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const subElement = ymap as PrimitiveSubElement;

  subElement.component = fragment.component;

  const stylesheet = getOrCreateYMap(subElement, "stylesheet");
  if (!attachStylesheet(stylesheet, fragment.component.project)) {
    throw new Error("Failed to attach stylesheet to ymap");
  }
  subElement.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `primitive-sub-element`,
    stylesheet,
  });

  Object.defineProperty(subElement, "interactions", {
    get() {
      return subElement.get("interactions") ?? {};
    },
    set(value) {
      subElement.set("interactions", value);
    },
  });

  subElement.interactions$ = subElement.observable$.pipe(
    map((v) => v.interactions ?? {}),
    distinctUntilChanged()
  );

  subElement.interaction = (event: string) => {
    return subElement.interactions[event];
  };

  subElement.interaction$ = (event: string) => {
    return subElement.interactions$.pipe(
      map((interactions) => interactions[event])
    );
  };

  subElement.setInteraction = (event: string, interaction: Expression) => {
    const interactions = { ...subElement.interactions };
    interactions[event] = interaction;
    subElement.set("interactions", interactions);
  };

  subElement.clearInteractions = () => {
    subElement.set("interactions", {});
  };

  const baseDispose = (subElement as unknown).dispose?.bind(subElement);
  subElement.dispose = () => {
    subElement.cssStyleSheet.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(subElement, attachPrimitiveSubElement);
  return true;
}

export function createPrimitiveSubElement(
  fragment: Fragment
): PrimitiveSubElement {
  const ymap = new y.Map<unknown>();
  if (!attachPrimitiveSubElement(ymap, fragment)) {
    throw new Error("Failed to attach primitive sub-element to ymap");
  }
  return ymap;
}
