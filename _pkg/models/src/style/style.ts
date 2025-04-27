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
import { MapCRDTModel } from "@elllphnt/elementa-utils";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../project/project";
import { StyleFragmentRegistry } from "./style_fragment_registry";

/**
 * A standalone modelization of an Elll StyleData object.
 * Can be used to store and manipulate style data.
 */
export class Style extends MapCRDTModel<StyleData> {
  readonly fragmentRegistry: StyleFragmentRegistry;
  readonly project: Project;

  private _settings$ = new BehaviorSubject<Record<string, any>>({});
  private _css$ = new BehaviorSubject<CssStyleData>({});

  get className() {
    return `elll-style-${this.key}`;
  }

  setting(key: string) {
    return this._settings$.value[key];
  }
  setting$(key: string) {
    return this._settings$.pipe(map((settings) => settings[key]));
  }

  get css() {
    return this._css$.value;
  }
  get css$() {
    return this._css$.asObservable();
  }

  propertyDefined(property: StylePropertyName) {
    return this.state[property] !== undefined;
  }
  propertyDefined$(property: StylePropertyName) {
    return this.state$.pipe(map((data) => data[property] !== undefined));
  }

  propertyValue<N extends StylePropertyName>(property: N): StyleData[N] {
    return this.state[property];
  }
  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<StyleData[N]> {
    return this.state$.pipe(map((data) => data[property]));
  }
  propertyValueWithoutUnset<N extends StylePropertyName>(
    property: N
  ): StyleData[N] {
    const value = this.propertyValue(property) as any;
    return (value === "unset" ? undefined : value) as any;
  }
  propertyValueWithoutUnset$<N extends StylePropertyName>(
    property: N
  ): Observable<StyleData[N]> {
    return this.propertyValue$(property).pipe(
      map((value) => (value === "unset" ? undefined : value))
    ) as any;
  }

  constructor(
    ymap: y.Map<any>,
    project: Project,
    fragmentRegistry: StyleFragmentRegistry
  ) {
    super(ymap);
    this.project = project;
    this.fragmentRegistry = fragmentRegistry;

    const cssSubscription = combineLatest([
      this.state$,
      this.fragmentRegistry.allFragments$,
    ]).subscribe(([data, fragments]) => {
      const css = styleToCss(data, {
        getFragment: (type, id) =>
          fragments.find((f) => f.type === type && f.id === id) as any,
      });
      this._css$.next(css);
    });

    this.addDisposer(() => {
      this._settings$.complete();
      this._css$.complete();

      cssSubscription.unsubscribe();
    });
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void {
    const nextValue = isVarRef(value)
      ? (value as VarRef)
      : (this.normalizeValue as any)(property, value);
    this.patch({
      [property]: nextValue,
    });
  }

  setSetting(key: string, value: any): void {
    this._settings$.next({
      ...this._settings$.value,
      [key]: value,
    });
  }

  getPropertyConfig<N extends StylePropertyName>(property: N) {
    return (stylePropertyConfigMap as any)[property] as StylePropertyConfig;
  }
  normalizeValue<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ) {
    if (value === undefined || value === "unset") {
      return value;
    }
    const dataType = getStyleDataType(value);
    if (!dataType) {
      throw Error(`Invalid value for property ${property}: ${value}`);
    }

    return normalizeStyleData(dataType, value);
  }
}
