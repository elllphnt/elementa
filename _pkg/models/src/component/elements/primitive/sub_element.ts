import { Expression, PrimitiveSubElementData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  Extendable,
  getOrCreateYMap,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { StylesheetCssStyleSheet } from "../../../css/_";
import { attachStylesheet } from "../../../style/stylesheet";
import { Component } from "../../component";
import { Fragment } from "../../fragment";

export type PrimitiveSubElement = ReturnType<
  typeof attachReactiveMap<PrimitiveSubElementData>
> & {
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
  ymap: y.Map<any>,
  fragment: Fragment
): PrimitiveSubElement {
  const subElement = attachReactiveMap<PrimitiveSubElementData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<PrimitiveSubElement>;

  subElement.component = fragment.component;

  subElement.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `primitive-sub-element`,
    stylesheet: attachStylesheet(
      getOrCreateYMap(subElement, "stylesheet"),
      fragment.component.project
    ),
  });

  Object.defineProperty(subElement, "interactions", {
    get() {
      return subElement.value.interactions ?? {};
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

  const baseDispose = (subElement as any).dispose?.bind(subElement);
  subElement.dispose = () => {
    subElement.cssStyleSheet.dispose();
    if (baseDispose) baseDispose();
  };

  setEnhancer(subElement, attachPrimitiveSubElement);
  return subElement as PrimitiveSubElement;
}

export function createPrimitiveSubElement(
  fragment: Fragment
): PrimitiveSubElement {
  const ymap = new y.Map<any>();
  return attachPrimitiveSubElement(ymap, fragment);
}
