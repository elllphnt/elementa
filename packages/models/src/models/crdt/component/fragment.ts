import { FragmentData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveList,
  combineLatestOrEmpty,
  getOrCreateYArray,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, switchMap } from "rxjs";
import * as y from "yjs";
import {
  BaseElement,
  Component,
  DataInput,
  Fragment,
} from "../../_interfaces/_.js";
import { attachDataInput } from "./data_input.js";
import { attachElement } from "./elements/_.js";
import { attachIdentifiable } from "./identifiable.js";

export enum FragmentVariant {
  Template = "template",
  Fragment = "fragment",
}

export function attachFragment(
  fragment: y.Map<any>,
  component: Component,
  variant: FragmentVariant = FragmentVariant.Fragment
): fragment is y.Map<any> & Fragment {
  assert(attachIdentifiable<FragmentData>(fragment));

  assert(setObjectProperty(fragment, "component", component));
  assert(setObjectProperty(fragment, "variant", variant));

  const content = getOrCreateYArray(fragment, "content");
  assert(
    attachEnhancedReactiveList<BaseElement>(content, attachElement, (ymap) =>
      attachElement(ymap, fragment as unknown as Fragment)
    )
  );
  assert(setObjectGetter(fragment, "content", () => content.items));
  assert(setObjectProperty(fragment, "content$", content.items$));

  const params = getOrCreateYArray<y.Map<any>>(fragment, "params");
  assert(
    attachEnhancedReactiveList<DataInput>(params, attachDataInput, (ymap) =>
      attachDataInput(ymap, component)
    )
  );
  assert(setObjectProperty(fragment, "params$", params.items$));
  assert(setObjectGetter(fragment, "params", () => params.items));

  assert(
    setObjectGetter(fragment, "allCssStylesheets", () =>
      fragment.content.flatMap((s) => s.allCssStylesheets)
    )
  );

  assert(
    setObjectProperty(
      fragment,
      "allCssStylesheets$",
      fragment.content$.pipe(
        switchMap((children) =>
          combineLatestOrEmpty(
            children.map((child) => child.allCssStylesheets$)
          )
        ),
        map((childrenSheets) => [...childrenSheets.flat()])
      )
    )
  );

  // --- Slot Registry ---
  const slotIdSet = new Set<string>();
  const _slotIds$ = new BehaviorSubject<string[]>([]);

  assert(setObjectProperty(fragment, "slotIds$", _slotIds$.asObservable()));
  assert(setObjectGetter(fragment, "slotIds", () => _slotIds$.value));

  assert(
    setObjectProperty(fragment, "registerSlotId", (id: string) => {
      if (!slotIdSet.has(id)) {
        slotIdSet.add(id);
        _slotIds$.next(Array.from(slotIdSet));
      }
    })
  );

  assert(
    setObjectProperty(fragment, "unregisterSlotId", (id: string) => {
      if (slotIdSet.delete(id)) {
        _slotIds$.next(Array.from(slotIdSet));
      }
    })
  );

  // --- Disposal ---
  const baseDispose = (fragment as any).dispose?.bind(fragment);
  (fragment as any).dispose = () => {
    _slotIds$.complete();
    (fragment.content as any).dispose?.();
    (params as any).dispose?.();
    baseDispose?.();
  };

  return setEnhancer<Fragment>(fragment, attachFragment);
}
