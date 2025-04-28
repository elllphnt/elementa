import { Expression, PrimitiveSubElementData } from "@elllphnt/elementa-base";
import { attachReactiveMap, Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { StylesheetCssStyleSheet } from "../../../css/_";
import { Stylesheet } from "../../../style/stylesheet";
import { Component } from "../../component";

export type PrimitiveSubElementModel = ReturnType<
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

export function withPrimitiveSubElementBehavior(
  ymap: y.Map<any>,
  component: Component
): PrimitiveSubElementModel {
  const subElement = attachReactiveMap<PrimitiveSubElementData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<PrimitiveSubElementModel>;

  subElement.component = component;

  subElement.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `primitive-sub-element`,
    stylesheet: new Stylesheet(
      subElement.getOrCreateMap("stylesheet"),
      component.project
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

  return subElement as PrimitiveSubElementModel;
}

export function createPrimitiveSubElementModel(
  component: Component
): PrimitiveSubElementModel {
  const ymap = new y.Map<any>();
  return withPrimitiveSubElementBehavior(ymap, component);
}
