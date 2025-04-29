import {
  getStyleDataType,
  isVarRef,
  normalizeStyleData,
  StyleData,
  StylePropertyConfig,
  stylePropertyConfigMap,
  StylePropertyName,
  VarRef,
} from "@elllphnt/elementa-base";
import { CssStyleData, styleToCss } from "@elllphnt/elementa-css";
import {
  attachReactiveMap,
  Extendable,
  setEnhancer,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { StyleFragmentRegistry } from "./style_fragment_registry";

export type Style = ReturnType<typeof attachReactiveMap<StyleData>> & {
  project: Project;
  fragmentRegistry: StyleFragmentRegistry;

  className: string;

  setting(key: string): any;
  setting$(key: string): Observable<any>;

  css: CssStyleData;
  css$: Observable<CssStyleData>;

  propertyDefined(property: StylePropertyName): boolean;
  propertyDefined$(property: StylePropertyName): Observable<boolean>;

  propertyValue<N extends StylePropertyName>(property: N): StyleData[N];
  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<StyleData[N]>;

  propertyValueWithoutUnset<N extends StylePropertyName>(
    property: N
  ): StyleData[N];
  propertyValueWithoutUnset$<N extends StylePropertyName>(
    property: N
  ): Observable<StyleData[N]>;

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void;
  setSetting(key: string, value: any): void;

  getPropertyConfig<N extends StylePropertyName>(
    property: N
  ): StylePropertyConfig;
  normalizeValue<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): any;
};

/**
 * Attach Style behavior to a y.Map
 */
export function attachStyle(
  ymap: y.Map<any>,
  project: Project,
  fragmentRegistry: StyleFragmentRegistry
): Style {
  const style = attachReactiveMap<StyleData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<Style>;

  style.project = project;
  style.fragmentRegistry = fragmentRegistry;

  const _settings$ = new BehaviorSubject<Record<string, any>>({});
  const _css$ = new BehaviorSubject<CssStyleData>({});

  style.setting = (key: string) => {
    return _settings$.value[key];
  };
  style.setting$ = (key: string) => {
    return _settings$.pipe(map((settings) => settings[key]));
  };

  Object.defineProperty(style, "className", {
    get() {
      return `style-${style.key}`;
    },
  });
  style.css$ = _css$.asObservable();

  style.propertyDefined = (property: StylePropertyName) => {
    return style.value[property] !== undefined;
  };

  style.propertyDefined$ = (property: StylePropertyName) => {
    return style.observable$.pipe(map((v) => v[property] !== undefined));
  };

  style.propertyValue = <N extends StylePropertyName>(property: N) => {
    return style.value[property];
  };

  style.propertyValue$ = <N extends StylePropertyName>(property: N) => {
    return style.observable$.pipe(map((v) => v[property]));
  };

  style.propertyValueWithoutUnset = <N extends StylePropertyName>(
    property: N
  ) => {
    const value = style.propertyValue(property);
    return (value === "unset" ? undefined : value) as any;
  };

  style.propertyValueWithoutUnset$ = <N extends StylePropertyName>(
    property: N
  ) => {
    return style
      .propertyValue$(property)
      .pipe(map((value) => (value === "unset" ? undefined : value))) as any;
  };

  style.setProperty = <N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ) => {
    const nextValue = isVarRef(value)
      ? (value as VarRef)
      : (style.normalizeValue as any)(property, value);

    style.patch({
      [property]: nextValue,
    });
  };

  style.setSetting = (key: string, value: any) => {
    _settings$.next({
      ..._settings$.value,
      [key]: value,
    });
  };

  style.getPropertyConfig = <N extends StylePropertyName>(property: N) => {
    return (stylePropertyConfigMap as any)[property] as StylePropertyConfig;
  };

  style.normalizeValue = <N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ) => {
    if (value === undefined || value === "unset") {
      return value;
    }
    const dataType = getStyleDataType(value);
    if (!dataType) {
      throw Error(`Invalid value for property ${property}: ${value}`);
    }
    return normalizeStyleData(dataType, value);
  };

  // Compute live CSS
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

  const baseDispose = (style as any).dispose?.bind(style);
  style.dispose = () => {
    _settings$.complete();
    _css$.complete();
    cssSub.unsubscribe();
    if (baseDispose) baseDispose();
  };

  setEnhancer(style, attachStyle);
  return style as Style;
}

/**
 * Create a new local Style
 */
export function createStyle(
  project: Project,
  fragmentRegistry: StyleFragmentRegistry
): Style {
  const ymap = new y.Map<any>();
  return attachStyle(ymap, project, fragmentRegistry);
}
