import {
  isVarRef,
  RawStyleData,
  StyleData,
  StylePropertyName,
  UnsettableStyleData,
  VariableStyleData,
} from "@elllphnt/elementa-base";
import { CssStyleData, styleToCss } from "@elllphnt/elementa-css";
import {
  attachReactiveMap,
  Extendable,
  ReactiveMap,
  setEnhancer,
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
import { Project } from "../project/project";
import { StyleFragmentRegistry } from "./style_fragment_registry";

export type Style = ReactiveMap<StyleData> & {
  project: Project;
  fragmentRegistry: StyleFragmentRegistry;
  className: string;

  // --- Property accessors ---

  /** Returns the raw value of a property (may be "unset" or varRef) */
  propertyValue<N extends StylePropertyName>(
    property: N
  ): UnsettableStyleData[N];
  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<UnsettableStyleData[N]>;

  /** Returns the value or undefined if it was "unset" (still may be a varRef) */
  propertyValueOrUndefined<N extends StylePropertyName>(
    property: N
  ): VariableStyleData[N];
  propertyValueOrUndefined$<N extends StylePropertyName>(
    property: N
  ): Observable<VariableStyleData[N]>;

  /** Returns the final runtime-resolved value (unset -> undefined, varRef resolved) */
  resolvedPropertyValue<N extends StylePropertyName>(
    property: N
  ): RawStyleData[N];
  resolvedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<RawStyleData[N]>; // Updated return type to RawStyleData[N]

  /** True if the property is explicitly defined (not inherited) */
  hasProperty(property: StylePropertyName): boolean;
  hasProperty$(property: StylePropertyName): Observable<boolean>;

  // --- Raw value accessors ---

  raw: Record<string, string>;
  raw$: Observable<Record<string, string>>;

  // --- Mutations ---

  /** Updates the value of a style property */
  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void;

  setRaw(raw: Record<string, string>): void;

  // --- Compiled CSS output (still may contain varRefs) ---

  css: CssStyleData;
  css$: Observable<CssStyleData>;
};

/**
 * Attaches a reactive Style object to a Y.Map, enhancing it with Style-specific methods.
 */
export function attachStyle(
  ymap: y.Map<any>,
  project: Project,
  fragmentRegistry: StyleFragmentRegistry
) {
  const style = attachReactiveMap<StyleData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<Style>;

  style.project = project;
  style.fragmentRegistry = fragmentRegistry;

  const _css$ = new BehaviorSubject<CssStyleData>({});

  // --- Base Fields ---

  Object.defineProperty(style, "className", {
    get() {
      return `style-${style.key}`;
    },
  });

  style.css$ = _css$.asObservable();

  // --- Property Logic ---

  style.propertyValue = <N extends StylePropertyName>(property: N) => {
    return style.value[property];
  };

  style.propertyValue$ = <N extends StylePropertyName>(property: N) => {
    return style.observable$.pipe(map((v) => v[property]));
  };

  style.propertyValueOrUndefined = (property: any) => {
    const value = style.propertyValue(property);
    return value === "unset" ? undefined : value;
  };

  style.propertyValueOrUndefined$ = (property: any) => {
    return style
      .propertyValue$(property)
      .pipe(map((value) => (value === "unset" ? undefined : value)));
  };

  style.resolvedPropertyValue = <N extends StylePropertyName>(property: N) => {
    const value = style.propertyValueOrUndefined(property);
    if (value && isVarRef(value)) {
      return style.project.styleManager.variableValue(value.__var) as any;
    }
    return value as any;
  };

  style.resolvedPropertyValue$ = <N extends StylePropertyName>(property: N) => {
    return style.propertyValueOrUndefined$(property).pipe(
      switchMap((value) => {
        if (value && isVarRef(value)) {
          return style.project.styleManager.variableValue$(value.__var) as any;
        }
        return of(value) as any;
      })
    ) as Observable<RawStyleData[N]>;
  };

  style.hasProperty = (property: StylePropertyName) => {
    return style.value[property] !== undefined;
  };

  style.hasProperty$ = (property: StylePropertyName) => {
    return style.observable$.pipe(map((v) => v[property] !== undefined));
  };

  style.setProperty = <N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ) => {
    style.patch({
      [property]: value,
    });
  };

  // --- Raw field (__raw in StyleData) ---

  style.raw = style.value.__raw ?? {};

  style.raw$ = style.observable$.pipe(map((v) => v.__raw ?? {}));

  // --- CSS generation ---

  const cssSub = combineLatest([
    style.observable$,
    fragmentRegistry.allFragments$,
  ]).subscribe(([value, fragments]) => {
    const [css, errors] = styleToCss(value, {
      getFragment: (type, id) =>
        fragments.find((f) => f.type === type && f.id === id) as any,
    });
    if (errors) {
      console.error(
        "The following errors occurred while generating CSS:",
        ...errors
      );
    }
    _css$.next(css);
  });

  // --- Cleanup ---

  const baseDispose = (style as any).dispose?.bind(style);
  style.dispose = () => {
    _css$.complete();
    cssSub.unsubscribe();
    if (baseDispose) baseDispose();
  };

  setEnhancer(style, attachStyle);
  return style as Style;
}

export function createStyle(
  project: Project,
  fragmentRegistry: StyleFragmentRegistry
): Style {
  const ymap = new y.Map<any>();
  return attachStyle(ymap, project, fragmentRegistry);
}
