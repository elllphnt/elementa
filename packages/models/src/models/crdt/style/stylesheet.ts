import { baseSelector, StyleSheetData } from "@elllphnt/elementa-base";
import {
  assert,
  attachEnhancedReactiveMap,
  attachReactiveMap,
  getOrCreateYArray,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, filter, map, tap } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../infrastructure/_.js";
import { Style } from "../../_interfaces/style/style.js";
import { Stylesheet } from "../../_interfaces/style/stylesheet.js";
import { attachStyle } from "./style.js";
import { attachStyleFragmentRegistry } from "./style_fragment_registry.js";

export function attachStylesheet(
  stylesheet: y.Map<any>,
  project: Project
): stylesheet is y.Map<any> & Stylesheet {
  assert(attachReactiveMap<StyleSheetData>(stylesheet));

  // Set project reference
  assert(setObjectProperty(stylesheet, "project", project));

  // Setup fragment registry
  const fragmentRegistry = getOrCreateYArray(stylesheet, "fragmentRegistry");
  assert(attachStyleFragmentRegistry(fragmentRegistry));
  assert(setObjectProperty(stylesheet, "fragmentRegistry", fragmentRegistry));

  // Setup styles
  const stylesYMap = getOrCreateYMap(stylesheet, "styles");
  assert(
    attachEnhancedReactiveMap<Style>(stylesYMap, attachStyle, (ymap) =>
      attachStyle(ymap, project, fragmentRegistry)
    )
  );
  assert(setObjectGetter(stylesheet, "styles", () => stylesYMap.items));
  assert(setObjectProperty(stylesheet, "styles$", stylesYMap.items$));

  // Setup class name
  assert(
    setObjectGetter(stylesheet, "className", () => {
      const name = stylesheet.get("name") as string;
      return `stylesheet-${name || (stylesheet.get("id") as string)}`;
    })
  );

  // Setup style getter
  assert(
    setObjectGetter(
      stylesheet,
      "style",
      () =>
        <C extends true | undefined>(selector: string, create?: C) => {
          let style = stylesYMap.get(selector) as unknown as Style;
          if (!style && create) {
            const newStyle = getOrCreateYMap(stylesYMap, selector);
            assert(attachStyle(newStyle, project, fragmentRegistry));
            stylesYMap.set(selector, style as unknown as y.Map<any>);
            style = newStyle;
          }
          return style as any as C extends true ? Style : Style | undefined;
        }
    )
  );

  assert(
    setObjectProperty(
      stylesheet,
      "style$",
      <C extends true | undefined>(selector: string, create?: C) => {
        return stylesYMap.items$.pipe(
          map((styles) => (styles as any)[selector] as unknown as Style),
          tap((style) => {
            if (!style && create) {
              const newStyle = getOrCreateYMap(stylesYMap, selector);
              assert(attachStyle(newStyle, project, fragmentRegistry));
              stylesYMap.set(selector, style as unknown as y.Map<any>);
            }
          }),
          filter((style) => !create || !!style)
        );
      }
    )
  );

  // Setup conditions
  assert(
    setObjectGetter(stylesheet, "conditions", () => {
      return (stylesheet.get("conditions") as Record<string, string>) || {};
    })
  );

  // Create a BehaviorSubject to track changes to conditions
  const _conditions$ = new BehaviorSubject<Record<string, string>>(
    stylesheet.conditions
  );
  stylesheet.observe((event) => {
    if (event.path.length === 1 && event.path[0] === "conditions") {
      _conditions$.next(stylesheet.conditions);
    }
  });

  assert(
    setObjectProperty(
      stylesheet,
      "conditions$",
      _conditions$.asObservable().pipe(distinctUntilChanged())
    )
  );

  assert(
    setObjectGetter(
      stylesheet,
      "condition",
      () => (id: string) => stylesheet.conditions[id]
    )
  );

  assert(
    setObjectProperty(stylesheet, "condition$", (id: string) =>
      stylesheet.conditions$.pipe(
        map((conditions) => conditions[id]),
        distinctUntilChanged()
      )
    )
  );

  // Setup selectors
  assert(
    setObjectGetter(stylesheet, "selectors", () => {
      return Object.keys(stylesYMap.toJSON());
    })
  );

  assert(
    setObjectProperty(
      stylesheet,
      "selectors$",
      stylesYMap.items$.pipe(
        map((styles) => Object.keys(styles)),
        distinctUntilChanged()
      )
    )
  );

  // Setup base style
  assert(
    setObjectGetter(
      stylesheet,
      "baseStyle",
      () =>
        <C extends true | undefined>(create?: C) => {
          return stylesheet.style(baseSelector, create);
        }
    )
  );

  assert(
    setObjectProperty(
      stylesheet,
      "baseStyle$",
      <C extends true | undefined>(create?: C) => {
        return stylesheet.style$(baseSelector, create);
      }
    )
  );

  // Implement addStyle method
  assert(
    setObjectProperty(stylesheet, "addStyle", (selector: string) => {
      if (!stylesYMap.has(selector)) {
        const newStyle = getOrCreateYMap(stylesYMap, selector);
        assert(attachStyle(newStyle, project, fragmentRegistry));
        stylesYMap.set(selector, newStyle);
      }
    })
  );

  // Implement removeStyle method
  assert(
    setObjectProperty(stylesheet, "removeStyle", (selector: string) => {
      if (stylesYMap.has(selector)) {
        stylesYMap.delete(selector);
      }
    })
  );

  // Implement setCondition method
  assert(
    setObjectProperty(
      stylesheet,
      "setCondition",
      (id: string, expression: string) => {
        const currentConditions = { ...stylesheet.conditions };
        currentConditions[id] = expression;
        stylesheet.set("conditions", currentConditions);
      }
    )
  );

  // Implement removeCondition method
  assert(
    setObjectProperty(stylesheet, "removeCondition", (id: string) => {
      const currentConditions = { ...stylesheet.conditions };
      if (id in currentConditions) {
        delete currentConditions[id];
        stylesheet.set("conditions", currentConditions);
      }
    })
  );

  // Setup cleanup
  const baseDispose = (stylesheet as any).dispose?.bind(stylesheet);
  (stylesheet as any).dispose = () => {
    _conditions$.complete();
    (stylesYMap as unknown as { dispose?: () => void }).dispose?.();
    baseDispose?.();
  };

  return setEnhancer<Stylesheet>(stylesheet, attachStylesheet);
}
