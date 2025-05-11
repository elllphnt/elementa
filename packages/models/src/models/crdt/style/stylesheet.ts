import { baseSelector, StyleSheetData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  getOrCreateYMap,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, distinctUntilChanged, filter, map } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../infrastructure/_.js";
import { Style } from "../../_interfaces/style/style.js";
import { Stylesheet } from "../../_interfaces/style/stylesheet.js";
import { createStyle } from "./style.js";
import { createStyleFragmentRegistry } from "./style_fragment_registry.js";

export function attachStylesheet(
  stylesheet: y.Map<any>,
  project: Project
): stylesheet is y.Map<any> & Stylesheet {
  assert(attachReactiveMap<StyleSheetData>(stylesheet));

  // Set project reference
  assert(setObjectProperty(stylesheet, "project", project));

  // Setup fragment registry
  const fragmentRegistry = createStyleFragmentRegistry();
  assert(setObjectProperty(stylesheet, "fragmentRegistry", fragmentRegistry));

  // Setup styles
  const stylesYMap = getOrCreateYMap(stylesheet, "styles");
  assert(attachReactiveMap(stylesYMap));
  assert(setObjectGetter(stylesheet, "styles", () => stylesYMap));

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
            style = createStyle(project, fragmentRegistry);
            stylesYMap.set(selector, style as unknown as y.Map<any>);
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
        const style = stylesheet.style(selector, create as true);
        if (style) {
          return stylesYMap.observe$("*").pipe(
            map(() => stylesYMap.get(selector) as unknown as Style),
            filter((s): s is Style => !!s)
          );
        }
        return stylesYMap
          .observe$("*")
          .pipe(
            map(() => stylesYMap.get(selector) as unknown as Style | undefined)
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
      stylesYMap.observe$("*").pipe(
        map(() => Object.keys(stylesYMap.toJSON())),
        distinctUntilChanged(
          (prev, curr) =>
            prev.length === curr.length &&
            prev.every((key, i) => key === curr[i])
        )
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

  // Setup cleanup
  const disposeBase = stylesheet.dispose || (() => {});
  stylesheet.dispose = () => {
    _conditions$.complete();
    fragmentRegistry.dispose?.();
    (stylesYMap as unknown as { dispose?: () => void }).dispose?.();
    disposeBase();
  };

  return true;
}
