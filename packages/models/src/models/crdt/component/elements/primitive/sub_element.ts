import { ResolvableOrEvaluable } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveMap,
  combineLatestOrEmpty,
  getOrCreateYArray,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import * as y from "yjs";
import {
  PrimitiveElement,
  PrimitiveSubElement,
} from "../../../../_interfaces/_.js";
import { ResolvableRecord } from "../../../../_lib/resolvable.js";
import { Fragment } from "../../fragment.js";
import { attachElementList, ElementList } from "../_list.js";
import { attachBaseElement } from "../element.js";
import {
  attachPrimitiveSubElement,
  createPrimitiveSubElement,
} from "./sub_element.js";

export function attachPrimitiveElement(
  element: y.Map<any>,
  fragment: Fragment
): element is y.Map<any> & PrimitiveElement {
  element.set("type", "primitive");
  assert(attachBaseElement(element, fragment));
  assert(setReactiveMapGetters(element, ["primitiveUrl", "props"]));

  const content = getOrCreateYArray(element, "content");
  assert(attachElementList(content, fragment));
  assert(setObjectProperty(element, "content", content as ElementList));

  assert(
    setObjectProperty(
      element,
      "allCssStylesheets$",
      combineLatestOrEmpty([content.allCssStylesheets$]).pipe(
        map(([sheets]) => [element.cssStyleSheet, ...sheets.flat()])
      )
    )
  );
  assert(
    setObjectGetter(element, "allCssStylesheets", () => [
      element.cssStyleSheet,
      ...element.content.allCssStylesheets,
    ])
  );

  const _props = new ResolvableRecord(
    element.get("props") ?? {},
    fragment.component.project.infrastructure
  );
  const propsSubscription = _props.subscribe(
    element.items$.pipe(map((v) => v.props ?? {}))
  );

  assert(setObjectGetter(element, "props", () => _props.value));
  assert(setObjectProperty(element, "props$", _props.value$));

  assert(
    setObjectGetter(element, "prop", () => (key: string) => _props.value[key])
  );
  assert(
    setObjectProperty(
      element,
      "prop$",
      (key: string): Observable<any> =>
        _props.value$.pipe(map((props) => props[key]))
    )
  );

  assert(
    setObjectProperty(
      element,
      "setProp",
      (key: string, value: ResolvableOrEvaluable<any> | undefined) => {
        const next = { ..._props.value };
        if (value === undefined) delete next[key];
        else next[key] = value;
        element.set("props", next);
      }
    )
  );

  assert(
    setObjectGetter(element, "primitiveAbsoluteUrl", () => {
      const url = element.primitiveUrl;
      return url ? fragment.component.project.absoluteFileUrl(url) : undefined;
    })
  );
  assert(
    setObjectProperty(
      element,
      "primitiveAbsoluteUrl$",
      element.primitiveUrl$.pipe(
        map((url) =>
          url ? fragment.component.project.absoluteFileUrl(url) : undefined
        )
      )
    )
  );

  const elements = attachEnhancedReactiveMap<PrimitiveSubElement>(
    getOrCreateYMap(element, "elements"),
    attachPrimitiveSubElement,
    (map) => attachPrimitiveSubElement(map, fragment)
  );
  assert(setObjectProperty(element, "elements", elements));
  assert(setObjectProperty(element, "elements$", elements.items$));

  assert(
    setObjectProperty(
      element,
      "element",
      (name: string, create?: true): PrimitiveSubElement => {
        let el = elements.get(name);
        if (!el && create) {
          elements.set(name, createPrimitiveSubElement(fragment));
          el = elements.get(name);
        }
        return el!;
      }
    )
  );

  assert(
    setObjectProperty(
      element,
      "element$",
      (name: string, create?: true): Observable<PrimitiveSubElement> =>
        elements.items$.pipe(
          map((items) => items[name]),
          tap((el) => {
            if (!el && create) {
              elements.set(name, createPrimitiveSubElement(fragment));
            }
          }),
          filter((el) => !!el || !create)
        ) as any
    )
  );

  const baseDispose = (element as any).dispose?.bind(element);
  (element as any).dispose = () => {
    propsSubscription.unsubscribe();
    _props.dispose();
    elements.dispose?.();
    baseDispose?.();
  };

  assert(
    setObjectProperty(element, "cloneIds", (clone: y.Map<any>) => {
      (element as any).cloneOwnId(clone);
    })
  );

  return setEnhancer<PrimitiveElement>(element, attachPrimitiveElement);
}
