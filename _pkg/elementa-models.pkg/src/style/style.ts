import {
  CssStyleData,
  getStyleDataType,
  isVarRef,
  normalizeStyleData,
  StyleData,
  StylePropertyConfig,
  stylePropertyConfigMap,
  StylePropertyName,
  styleToCss,
  VarRef,
} from "@elllphnt/elll-element";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, combineLatest, map, Observable } from "rxjs";
import { Project } from "~/src/project/_";
import { StyleFragmentRegistry } from "./style_fragment_set";

/**
 * A standalone modelization of an Elll StyleData object.
 * Can be used to store and manipulate style data.
 */
export class Style extends Disposable implements Datafiable<StyleData> {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${Style.keySeed}-${Style.key++}`;

  readonly fragmentRegistry: StyleFragmentRegistry;
  readonly project: Project;

  private _data$ = new BehaviorSubject<StyleData>({});
  private _settings$ = new BehaviorSubject<Record<string, any>>({});
  private _css$ = new BehaviorSubject<CssStyleData>({});

  get className() {
    return `elll-style-${this.key}`;
  }

  get data() {
    return this._data$.value;
  }
  get data$() {
    return this._data$.asObservable();
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
    return this.data[property] !== undefined;
  }
  propertyDefined$(property: StylePropertyName) {
    return this.data$.pipe(map((data) => data[property] !== undefined));
  }

  propertyValue<N extends StylePropertyName>(property: N): StyleData[N] {
    return this.data[property];
  }
  propertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<StyleData[N]> {
    return this.data$.pipe(map((data) => data[property]));
  }
  provertyValueWithoutUnset<N extends StylePropertyName>(
    property: N,
  ): StyleData[N] {
    const value = this.propertyValue(property) as any;
    return (value === "unset" ? undefined : value) as any;
  }
  propertyValueWithoutUnset$<N extends StylePropertyName>(
    property: N,
  ): Observable<StyleData[N]> {
    return this.propertyValue$(property).pipe(
      map((value) => (value === "unset" ? undefined : value)),
    ) as any;
  }

  constructor({
    project,
    fragmentRegistry,
  }: {
    project: Project;
    fragmentRegistry: StyleFragmentRegistry;
  }) {
    super();
    this.project = project;
    this.fragmentRegistry = fragmentRegistry;

    const cssSubscription = combineLatest([
      this.data$,
      this.fragmentRegistry.allFragments$,
    ]).subscribe(([data, fragments]) => {
      const css = styleToCss(data, {
        getFragment: (type, id) =>
          fragments.find((f) => f.type === type && f._id === id) as any,
      });
      this._css$.next(css);
    });

    this.addDisposer(() => {
      this._data$.complete();
      this._settings$.complete();
      this._css$.complete();

      cssSubscription.unsubscribe();
    });
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N],
  ): void {
    const nextValue = isVarRef(value)
      ? (value as VarRef)
      : (this.normalizeValue as any)(property, value);
    this._data$.next({
      ...this.data,
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
    value: StyleData[N],
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

  restore(data: StyleData): void {
    this._data$.next(data);
  }
}
