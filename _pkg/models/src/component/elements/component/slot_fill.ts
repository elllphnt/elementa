import { Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  attachReactiveMap,
  combineLatestOrEmpty,
  getOrCreateYArray,
  getOrCreateYMap,
  ReactiveMap,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../../css/_";
import { attachStylesheet } from "../../../style/stylesheet";
import { Component } from "../../component";
import { Fragment } from "../../fragment";
import { attachElementList, ElementList } from "../_list";

export type SlotFill = ReactiveMap<SlotFillData> & {
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

  cloneIds(clone: y.Map<unknown>): void;
};

export function attachSlotFill(
  ymap: y.Map<unknown>,
  fragment: Fragment
): ymap is SlotFill {
  if (!attachReactiveMap<SlotFillData>(ymap as y.Map<unknown>)) {
    throw new Error("Failed to attach reactive map to ymap");
  }
  const slot = ymap as SlotFill;

  slot.component = fragment.component;

  const stylesheet = getOrCreateYMap(slot, "stylesheet");
  if (!attachStylesheet(stylesheet, fragment.component.project)) {
    throw new Error("Failed to attach stylesheet to ymap");
  }
  slot.cssStyleSheet = new StylesheetCssStyleSheet({
    target: `slot-fill`,
    stylesheet,
  });

  const content = getOrCreateYArray(slot, "content");
  attachElementList(getOrCreateYArray(slot, "content"), fragment);
  slot.content = content as ElementList;

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
      return slot.get("interactions") ?? {};
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

  slot.cloneIds = (clone: y.Map<unknown>) => {
    slot.content.cloneIds(getOrCreateYArray(clone, "content"));
  };

  const baseDispose = (slot as unknown).dispose?.bind(slot);
  slot.dispose = () => {
    slot.content.dispose();
    slot.cssStyleSheet.dispose();
    if (baseDispose) baseDispose();
  };

  return true;
}

export function createSlotFill(fragment: Fragment): SlotFill {
  const ymap = new y.Map<unknown>();
  if (!attachSlotFill(ymap, fragment)) {
    throw new Error("Failed to create SlotFill");
  }
  return ymap as SlotFill;
}
