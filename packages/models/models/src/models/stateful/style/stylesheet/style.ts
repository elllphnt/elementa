import {
  baseSelector,
  isVarRef,
  RawStyleData,
  StyleData,
  StylePropertyName,
  UnsettableStyleData,
  VariableStyleData,
} from "@elllphnt/elementa-base";
import { Project, Style, StyleFragmentRegistry } from "@elllphnt/elementa-core";
import {
  CssStyleData,
  styleToCss,
  StyleToCssContext,
} from "@elllphnt/elementa-css";
import {
  combineLatestMerged,
  keyManager,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";

export class StatefulStyle extends Model<StyleData> implements Style {
  readonly selector: string;
  readonly project: Project;
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _properties: RecordState<UnsettableStyleData>;
  private _raw: RecordState<Record<string, string>>;

  private _css$ = new BehaviorSubject<CssStyleData>({});
  private _errors$ = new BehaviorSubject<Error[]>([]);

  get className() {
    return this.key;
  }

  constructor({
    init,
    project,
    selector,
    fragmentRegistry,
  }: {
    init: StyleData;
    project: Project;
    selector?: string;
    fragmentRegistry: StyleFragmentRegistry;
  }) {
    const { __raw, ...styleData } = init;
    super({ key: keyManager.next("style") });

    this.selector = selector || baseSelector;
    this.project = project;
    this.fragmentRegistry = fragmentRegistry;

    this._properties = new RecordState<UnsettableStyleData>({
      init: styleData,
    });
    this._raw = new RecordState<Record<string, string>>({ init: __raw || {} });

    const cssSubscription = combineLatest([
      this._properties.record$,
      this._raw.record$,
      this.fragmentRegistry.allFragments$,
    ]).subscribe(([properties, raw, fragments]) => {
      const context: StyleToCssContext = {
        getFragment: (type, id) =>
          fragments.find((f) => f.type === type && f.id == id) as any,
      };
      const [css, errors] = styleToCss(
        {
          ...properties,
          __raw: raw,
        },
        context
      );
      this._css$.next(css);
      this._errors$.next(errors);
    });

    this.addDisposer(() => {
      this._properties.dispose();
      this._raw.dispose();
      this._css$.complete();
      this._errors$.complete();
      cssSubscription.unsubscribe();
    });
  }

  get data(): StyleData {
    return {
      ...this._properties.record,
      __raw: this._raw.record,
    };
  }
  get data$(): Observable<StyleData> {
    return combineLatestMerged([
      this._properties.record$,
      combineLatest({
        __raw: this._raw.record$,
      }),
    ]);
  }

  propertyValue<N extends StylePropertyName>(
    property: N
  ): UnsettableStyleData[N] {
    return this._properties.entry(property);
  }

  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<UnsettableStyleData[N]> {
    return this._properties.entry$(property);
  }

  propertyValueOrUndefined<N extends StylePropertyName>(
    property: N
  ): VariableStyleData[N] {
    const value = this.propertyValue(property);
    return (value === "unset" ? undefined : value) as VariableStyleData[N];
  }
  propertyValueOrUndefined$<N extends StylePropertyName>(
    property: N
  ): Observable<VariableStyleData[N]> {
    return this.propertyValue$(property).pipe(
      map((value) => {
        return (value === "unset" ? undefined : value) as VariableStyleData[N];
      })
    );
  }

  resolvedPropertyValue<N extends StylePropertyName>(
    property: N
  ): RawStyleData[N] {
    const value = this.propertyValueOrUndefined(property);
    if (isVarRef(value)) {
      return this.project.styleManager.varRefValue(
        this.selector,
        value
      ) as RawStyleData[N];
    } else {
      return value as unknown as RawStyleData[N];
    }
  }

  resolvedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<RawStyleData[N]> {
    return this.propertyValueOrUndefined$(property).pipe(
      switchMap((value: unknown) => {
        if (isVarRef(value)) {
          return this.project.styleManager.varRefValue$(
            this.selector,
            value
          ) as Observable<RawStyleData[N]>;
        } else {
          return of(value as unknown as RawStyleData[N]);
        }
      })
    );
  }

  hasProperty(property: StylePropertyName): boolean {
    return this.propertyValue(property) !== undefined;
  }

  hasProperty$(property: StylePropertyName): Observable<boolean> {
    return this.propertyValue$(property).pipe(
      map((value) => {
        return value !== undefined;
      })
    );
  }

  get raw(): Record<string, string> {
    return { ...this._raw.record };
  }

  get raw$(): Observable<Record<string, string>> {
    return this._raw.record$;
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void {
    this._properties.set(property, value);
  }

  setRaw(raw: Record<string, string>): void {
    this._raw.setRecord(raw);
  }

  get css(): CssStyleData {
    return this._css$.value;
  }

  get css$(): Observable<CssStyleData> {
    return this._css$.asObservable();
  }

  restore(data: StyleData): void {
    const { __raw, ...properties } = data;

    this._properties.setRecord(properties);
    this._raw.setRecord(__raw || {});
  }
}
