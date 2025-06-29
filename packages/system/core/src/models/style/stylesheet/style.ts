import {
  baseSelector,
  isVarRef,
  RawStyleData,
  StyleData,
  StylePropertyName,
  UnsettableStyleData,
  VariableStyleData,
} from "@elllphnt/elementa-base";
import {
  CssStyleData,
  styleToCss,
  StyleToCssContext,
} from "@elllphnt/elementa-css";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { Project } from "~/project/_.js";
import { StyleFragmentRegistry } from "./style_fragment_registry.js";

export class Style extends Model<RecordState<StyleData>> {
  readonly selector: string;
  readonly project: Project;
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _css$ = new BehaviorSubject<CssStyleData>({});

  get className(): string {
    return this.key;
  }

  constructor({
    state,
    project,
    selector,
    fragmentRegistry,
  }: {
    state: RecordState<StyleData>;
    project: Project;
    selector?: string;
    fragmentRegistry: StyleFragmentRegistry;
  }) {
    super({ state });

    this.selector = selector || baseSelector;
    this.project = project;
    this.fragmentRegistry = fragmentRegistry;

    // Subscribe to changes and compute CSS
    const cssSubscription = combineLatest([
      this.state.record$,
      this.fragmentRegistry.allFragments$,
    ]).subscribe(([properties, fragments]) => {
      const context: StyleToCssContext = {
        getFragment: (type, id) =>
          fragments?.find((f) => f.type === type && f.id === id) as any,
      };
      const [css] = styleToCss(properties as StyleData, context);
      this._css$.next(css);
    });

    this.addDisposer(() => {
      this._css$.complete();
      cssSubscription.unsubscribe();
    });
  }

  propertyValue<N extends StylePropertyName>(
    property: N
  ): UnsettableStyleData[N] {
    return this.state.entry(property);
  }
  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<UnsettableStyleData[N]> {
    return this.state.entry$(property);
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
      map(
        (value) =>
          (value === "unset" ? undefined : value) as VariableStyleData[N]
      )
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
      map((value) => value !== undefined)
    );
  }

  get raw(): Record<string, string> {
    return { ...(this.state.entry("__raw") || {}) };
  }
  get raw$(): Observable<Record<string, string>> {
    return this.state.entry$("__raw").pipe(map((raw) => raw || {}));
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void {
    this.state.set(property, value);
  }

  setRaw(raw: Record<string, string>): void {
    this.state.set("__raw", raw);
  }

  get css(): CssStyleData {
    return this._css$.value;
  }
  get css$(): Observable<CssStyleData> {
    return this._css$.asObservable();
  }
}
