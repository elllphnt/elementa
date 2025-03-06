import {
  CssStyleData,
  getDataType,
  isVarRef,
  StyleData,
  StylePropertyConfig,
  stylePropertyConfigMap,
  StylePropertyName,
  styleToCss,
  VarRef,
} from "@elllphnt/elll-element";
import { Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Project } from "~/src/project/_";

/**
 * A standalone modelization of an Elll StyleData object.
 * Can be used to store and manipulate style data.
 */
export class Style extends Disposable implements Datafiable<StyleData> {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  key = `${Style.keySeed}-${Style.key++}`;

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
    return value === "unset" ? undefined : value;
  }
  propertyValueWithoutUnset$<N extends StylePropertyName>(
    property: N,
  ): Observable<StyleData[N]> {
    return this.propertyValue$(property).pipe(
      map((value) => (value === "unset" ? undefined : value)),
    ) as any;
  }

  constructor({ project }: { project: Project }) {
    super();
    this.project = project;

    const cssSubscription = this.data$.subscribe((data) => {
      const css = styleToCss(data, { variables: {} });
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
    const [dataType, dataTypeConfig] =
      getDataType(this.getPropertyConfig(property), value) ?? [];
    if (!dataType || !dataTypeConfig) {
      throw Error(`Invalid value for property ${property}: ${value}`);
    }

    const normalize = dataTypeConfig.normalize;
    if (normalize) {
      return normalize(value);
    } else {
      return value;
    }
  }

  restore(data: StyleData): void {
    this._data$.next(data);
  }
}
