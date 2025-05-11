import { ComponentElementData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveMap,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import {
  filter,
  map,
  Observable,
  combineLatest as rxCombineLatest,
  switchMap,
  tap,
} from "rxjs";
import * as y from "yjs";
import { ResolvableRecord } from "../../../../../_lib/resolvable.js";
import { ComponentElement, SlotFill } from "../../../../_interfaces/_.js";
import { Fragment } from "../../fragment.js";
import { attachBaseElement } from "../element.js";
import { attachSlotFill } from "./slot_fill.js";

export function attachComponentElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & ComponentElement {
  element.set("type", "component");
  assert(attachBaseElement<ComponentElementData>(element, fragment));

  assert(setReactiveMapGetters(element, ["componentUrl"]));

  const fillsMap = getOrCreateYMap(element, "fills");
  assert(
    attachEnhancedReactiveMap<SlotFill>(fillsMap, attachSlotFill, (ymap) =>
      attachSlotFill(ymap, fragment)
    )
  );
  assert(setObjectGetter(element, "fills", () => fillsMap.items));
  assert(setObjectProperty(element, "fills$", fillsMap.items$));

  const _props = new ResolvableRecord(
    (element.get("props") as Record<string, any>) ?? {},
    fragment.component.project.infrastructure
  );
  const propsSubscription = _props.subscribe(
    element.items$.pipe(map((v) => v.props ?? {}))
  );

  // allCssStylesheets
  assert(
    setObjectGetter(element, "allCssStylesheets", () => [
      ...element.allCssStylesheets,
      ...Object.values(fillsMap.items).flatMap(
        (s: SlotFill) => s.allCssStylesheets
      ),
    ])
  );
  assert(
    setObjectProperty(
      element,
      "allCssStylesheets$",
      rxCombineLatest([
        element.allCssStylesheets$,
        fillsMap.items$.pipe(
          switchMap((slots) =>
            rxCombineLatest(
              Object.values(slots).map((s) => s.allCssStylesheets$)
            )
          )
        ),
      ]).pipe(map(([self, slots]) => [...self, ...slots.flat()]))
    )
  );

  // localComponent (resolved from absoluteComponentUrl)
  assert(
    setObjectGetter(element, "absoluteComponentUrl", () => {
      const url = element.componentUrl;
      return url ? fragment.component.project.absoluteFileUrl(url) : undefined;
    })
  );
  assert(
    setObjectProperty(
      element,
      "absoluteComponentUrl$",
      element.componentUrl$.pipe(
        map((url) =>
          url ? fragment.component.project.absoluteFileUrl(url) : undefined
        )
      )
    )
  );

  assert(
    setObjectGetter(element, "localComponent", () => {
      const url = element.absoluteComponentUrl;
      return url
        ? fragment.component.project.infrastructure.component(url)
        : undefined;
    })
  );
  assert(
    setObjectProperty(
      element,
      "localComponent$",
      element.absoluteComponentUrl$.pipe(
        map((url) =>
          url
            ? fragment.component.project.infrastructure.component(url)
            : undefined
        )
      )
    )
  );

  // props
  assert(setObjectGetter(element, "props", () => _props.value));
  assert(setObjectProperty(element, "props$", _props.value$));

  // prop(key)
  assert(
    setObjectGetter(element, "prop", () => (key: string) => element.props[key])
  );
  assert(
    setObjectProperty(
      element,
      "prop$",
      (key: string): Observable<any> =>
        element.props$.pipe(map((props) => props[key]))
    )
  );

  // setProp
  assert(
    setObjectProperty(element, "setProp", (key: string, value: any) => {
      const newProps = { ...element.props };
      if (value === undefined) delete newProps[key];
      else newProps[key] = value;
      element.set("props", newProps);
    })
  );

  // fill(id, create?)
  assert(
    setObjectProperty(
      element,
      "fill",
      (id: string, create?: true): SlotFill => {
        let item = fillsMap.get(id);
        if (!item && create) {
          const newFills = getOrCreateYMap(fillsMap, id);
          assert(attachSlotFill(newFills, fragment));
          fillsMap.set(id, newFills);
          item = fillsMap.get(id);
        }
        return item!;
      }
    )
  );

  // fill$(id, create?)
  assert(
    setObjectProperty(
      element,
      "fill$",
      (id: string, create?: true): Observable<SlotFill> =>
        fillsMap.items$.pipe(
          map((fills: Record<string, SlotFill>) => fills[id]),
          tap((item) => {
            if (!item && create) {
              const newFills = getOrCreateYMap(fillsMap, id);
              assert(attachSlotFill(newFills, fragment));
              fillsMap.set(id, newFills);
              item = fillsMap.get(id);
            }
          }),
          filter((item) => !!item || !create)
        )
    )
  );
  assert(
    setObjectProperty(
      element,
      "setFill",
      (id: string, value: SlotFill | undefined) => {
        const newFills = { ...fillsMap.items };
        if (value === undefined) delete newFills[id];
        else newFills[id] = value;
        fillsMap.set("items", newFills);
      }
    )
  );
  assert(
    setObjectProperty(element, "setComponentUrl", (url: string | undefined) => {
      element.set("componentUrl", url);
    })
  );

  // Cleanup
  const baseDispose = element.dispose?.bind(element);
  element.dispose = () => {
    propsSubscription.unsubscribe();
    _props.dispose();
    fillsMap.dispose?.();
    baseDispose?.();
  };

  return setEnhancer<ComponentElement>(element, attachComponentElement);
}
