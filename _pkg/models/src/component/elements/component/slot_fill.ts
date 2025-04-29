import { Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  combineLatestOrEmpty,
  Extendable,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../../css/_";
import { attachStylesheet } from "../../../style/stylesheet";
import { Component } from "../../component";
import { attachElementList, ElementList } from "../_list";

export type SlotFill = ReturnType<typeof attachReactiveMap<SlotFillData>> & {
  component: Component;
  cssStyleSheet: StylesheetCssStyleSheet;
  content: ElementList;

  allCssStylesheets: CssStyleSheet[];
  allCssStylesheets$: Observable<CssStyleSheet[]>;

  interactions: Record<string, Expression>;
  interactions$: Observable<Record<string, Expression>>;

  interaction(event: string): Expression | undefined;
  interaction$(event: string): Observable<Expression | undefined>;

  setInteraction(event: string, interaction: Expression): void;
  clearInteractions(): void;

  cloneIds(clone: y.Map<any>): void;
};

export function attachSlotFill(
  ymap: y.Map<any>,
  component: Component
): SlotFill {
  const slot = attachReactiveMap<SlotFillData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<SlotFill>;

  slot.component = component;

  slot.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `slot-fill`,
    stylesheet: attachStylesheet(
      getOrCreateYMap(slot, "stylesheet"),
      component.project
    ),
  });

  slot.content = attachElementList(
    getOrCreateYArray(slot, "content"),
    component
  );

  Object.defineProperty(slot, "allCssStylesheets", {
    get() {
      return [slot.cssStyleSheet, ...slot.content.allCssStylesheets];
    },
    configurable: true,
  });

  slot.allCssStylesheets$ = combineLatestOrEmpty([
    slot.content.allCssStylesheets$,
  ]).pipe(map(([children]) => [slot.cssStyleSheet, ...children.flat()]));

  Object.defineProperty(slot, "interactions", {
    get() {
      return slot.value.interactions ?? {};
    },
    set(value) {
      slot.set("interactions", value);
    },
  });

  slot.interactions$ = slot.observable$.pipe(map((v) => v.interactions ?? {}));

  slot.interaction = (event: string) => {
    return slot.interactions[event];
  };

  slot.interaction$ = (event: string) => {
    return slot.interactions$.pipe(map((interactions) => interactions[event]));
  };

  slot.setInteraction = (event: string, interaction: Expression) => {
    const newInteractions = { ...slot.interactions };
    newInteractions[event] = interaction;
    slot.set("interactions", newInteractions);
  };

  slot.clearInteractions = () => {
    slot.set("interactions", {});
  };

  slot.cloneIds = (clone: y.Map<any>) => {
    slot.content.cloneIds(getOrCreateYArray(clone, "content"));
  };

  const baseDispose = (slot as any).dispose?.bind(slot);
  slot.dispose = () => {
    slot.content.dispose();
    slot.cssStyleSheet.dispose();
    if (baseDispose) baseDispose();
  };

  return slot as SlotFill;
}

export function createSlotFill(component: Component): SlotFill {
  const ymap = new y.Map<any>();
  return attachSlotFill(ymap, component);
}
