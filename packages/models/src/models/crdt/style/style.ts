import {
  isVarRef,
  RawStyleData,
  StyleData,
  StylePropertyName,
  UnsettableStyleData,
} from "@elllphnt/elementa-base";
import { CssStyleData, styleToCss } from "@elllphnt/elementa-css";
import {
  assert,
  attachReactiveMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import * as y from "yjs";
import { Project } from "../../../infrastructure/_.js";
import { StyleFragmentRegistry } from "../../_interfaces/_.js";
import { Style } from "../../_interfaces/style/style.js";

export function attachStyle(
  style: y.Map<any>,
  project: Project,
  fragmentRegistry: StyleFragmentRegistry
): style is y.Map<any> & Style {
  assert(attachReactiveMap<StyleData>(style));

  // Set project and fragment registry
  assert(setObjectProperty(style, "project", project));
  assert(setObjectProperty(style, "fragmentRegistry", fragmentRegistry));

  // Set up CSS styles
  const _css$ = new BehaviorSubject<CssStyleData>({});
  assert(setObjectProperty(style, "css$", _css$.asObservable()));
  assert(setObjectGetter(style, "css", () => _css$.getValue()));

  // Setup class name
  assert(
    setObjectGetter(style, "className", () => `style-${style.get("key")}`)
  );

  // Property accessors
  assert(
    setObjectGetter(
      style,
      "propertyValue",
      () =>
        <N extends StylePropertyName>(property: N) =>
          style.get(property) as UnsettableStyleData[N]
    )
  );

  assert(
    setObjectProperty(
      style,
      "propertyValue$",
      <N extends StylePropertyName>(property: N) =>
        style.items$.pipe(
          map((items) => items[property] as UnsettableStyleData[N])
        )
    )
  );

  assert(
    setObjectGetter(
      style,
      "propertyValueOrUndefined",
      () =>
        <N extends StylePropertyName>(property: N) => {
          const value = style.propertyValue(property);
          return value === "unset" ? undefined : value;
        }
    )
  );

  assert(
    setObjectProperty(
      style,
      "propertyValueOrUndefined$",
      <N extends StylePropertyName>(property: N) =>
        style
          .propertyValue$(property)
          .pipe(map((value) => (value === "unset" ? undefined : value)))
    )
  );

  assert(
    setObjectGetter(
      style,
      "resolvedPropertyValue",
      () =>
        <N extends StylePropertyName>(property: N) => {
          const value = style.propertyValueOrUndefined(property);
          if (value && isVarRef(value)) {
            return style.project.styleManager.variableValue(
              value.__var
            ) as RawStyleData[N];
          }
          return value as RawStyleData[N];
        }
    )
  );

  assert(
    setObjectProperty(
      style,
      "resolvedPropertyValue$",
      <N extends StylePropertyName>(property: N) =>
        style.propertyValueOrUndefined$(property).pipe(
          switchMap((value) => {
            if (value && isVarRef(value)) {
              return style.project.styleManager.variableValue$(
                value.__var
              ) as Observable<RawStyleData[N]>;
            }
            return of(value) as Observable<RawStyleData[N]>;
          })
        )
    )
  );

  assert(
    setObjectGetter(
      style,
      "hasProperty",
      () => (property: StylePropertyName) => style.get(property) !== undefined
    )
  );

  assert(
    setObjectProperty(style, "hasProperty$", (property: StylePropertyName) =>
      style.items$.pipe(map((items) => items[property] !== undefined))
    )
  );

  // Raw value accessors
  assert(
    setObjectGetter(style, "raw", () => {
      const raw: Record<string, string> = {};
      for (const [key, value] of Object.entries(style.toJSON())) {
        if (key.startsWith("__")) {
          raw[key.slice(2)] = value as string;
        }
      }
      return raw;
    })
  );

  assert(
    setObjectProperty(
      style,
      "raw$",
      style.items$.pipe(map((v) => v.__raw ?? {}))
    )
  );

  // Mutations
  assert(
    setObjectProperty(
      style,
      "setProperty",
      <N extends StylePropertyName>(property: N, value: StyleData[N]) => {
        style.set(property, value);
      }
    )
  );

  assert(
    setObjectProperty(style, "setRaw", (raw: Record<string, string>) => {
      for (const [key, value] of Object.entries(raw)) {
        style.set(`__${key}`, value);
      }
    })
  );

  // Generate CSS
  const cssSub = combineLatest([
    style.items$,
    fragmentRegistry.allFragments$,
  ]).subscribe(([value, fragments]) => {
    const [css, errors] = styleToCss(value, {
      getFragment: (type, id) =>
        fragments.find((f) => f.type === type && f.id === id) as any,
    });
    if (errors.length) {
      console.error(
        "The following errors occurred while generating CSS:",
        ...errors
      );
    }
    _css$.next(css);
  });

  // Setup cleanup
  const baseDispose = (style as any).dispose?.bind(style);
  (style as any).dispose = () => {
    _css$.complete();
    cssSub.unsubscribe();
    baseDispose?.();
  };

  return setEnhancer<Style>(style as any, attachStyle);
}
