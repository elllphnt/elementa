import { Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveList,
  attachReactiveMap,
  combineLatestOrEmpty,
  getOrCreateYArray,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { map, Observable, switchMap } from "rxjs";
import * as y from "yjs";
import { StylesheetCssStyleSheet } from "../../../../../css/_.js";
import { BaseElement, Fragment, SlotFill } from "../../../../_interfaces/_.js";
import { attachStylesheet } from "../../../style/stylesheet.js";
import { attachElement } from "../_create.js";

export function attachSlotFill(
  slot: y.Map<any>,
  fragment: Fragment
): slot is y.Map<any> & SlotFill {
  assert(attachReactiveMap<SlotFillData>(slot));
  assert(setObjectProperty(slot, "component", fragment.component));

  const stylesheet = getOrCreateYMap(slot, "stylesheet");
  assert(attachStylesheet(stylesheet, fragment.component.file));

  const cssStyleSheet = new StylesheetCssStyleSheet({
    target: "slot-fill",
    stylesheet,
  });
  assert(setObjectProperty(slot, "cssStyleSheet", cssStyleSheet));

  const content = getOrCreateYArray(slot, "content");
  assert(
    attachEnhancedReactiveList<BaseElement>(content, attachElement, (ymap) =>
      attachElement(ymap, fragment)
    )
  );
  assert(setObjectGetter(slot, "content", () => content.items));
  assert(setObjectProperty(slot, "content$", content.items$));

  // allCssStylesheets
  assert(
    setObjectGetter(slot, "allCssStylesheets", () => [
      cssStyleSheet,
      ...slot.content.flatMap((s) => s.allCssStylesheets),
    ])
  );

  assert(
    setObjectProperty(
      slot,
      "allCssStylesheets$",
      combineLatestOrEmpty([
        slot.content$.pipe(
          switchMap((children) =>
            combineLatestOrEmpty(
              children.map((child) => child.allCssStylesheets$)
            )
          )
        ),
      ]).pipe(map(([children]) => [cssStyleSheet, ...children.flat()]))
    )
  );

  // interactions
  assert(
    setObjectGetter(slot, "interactions", () => slot.get("interactions") ?? {})
  );
  assert(
    setObjectProperty(
      slot,
      "interactions$",
      slot.items$.pipe(map((v) => v.interactions ?? {}))
    )
  );

  // interaction(event)
  assert(
    setObjectGetter(
      slot,
      "interaction",
      () => (event: string) => slot.interactions[event]
    )
  );

  // interaction$(event)
  assert(
    setObjectProperty(
      slot,
      "interaction$",
      (event: string): Observable<Expression | undefined> =>
        slot.interactions$.pipe(map((interactions) => interactions[event]))
    )
  );

  // setInteraction
  assert(
    setObjectProperty(
      slot,
      "setInteraction",
      (event: string, expr: Expression) => {
        const updated = { ...slot.interactions };
        updated[event] = expr;
        slot.set("interactions", updated);
      }
    )
  );

  // clearInteractions
  assert(
    setObjectProperty(slot, "clearInteractions", () => {
      slot.set("interactions", {});
    })
  );

  // Cleanup
  const baseDispose = (slot as any).dispose?.bind(slot);
  (slot as any).dispose = () => {
    cssStyleSheet.dispose?.();
    baseDispose?.();
  };

  return setEnhancer<SlotFill>(slot, attachSlotFill);
}
