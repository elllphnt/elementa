import { ensureField } from "@elllphnt/crdt";
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
  CrdtModel,
  CrdtRecordState,
  keyManager,
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

export class CrdtStyle extends CrdtModel<y.Map<any>> implements Style {
  readonly selector: string;
  readonly project: Project;
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _state: CrdtRecordState<
    UnsettableStyleData & { __raw?: Record<string, string> }
  >;
  private _css$ = new BehaviorSubject<CssStyleData>({});

  get className(): string {
    return this.key;
  }

  constructor({
    crdt,
    project,
    selector,
    fragmentRegistry,
    initialized,
  }: {
    crdt: y.Map<any>;
    project: Project;
    selector?: string;
    fragmentRegistry: StyleFragmentRegistry;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("style"), crdt });

    this.selector = selector || baseSelector;
    this.project = project;
    this.fragmentRegistry = fragmentRegistry;

    if (!initialized) {
      ensureField(crdt, "__raw", () => ({}));
    }

    this._state = new CrdtRecordState(crdt);

    // Subscribe to changes and compute CSS
    const cssSubscription = combineLatest([
      this._state.record$,
      this.fragmentRegistry.allFragments$,
    ]).subscribe(([properties, fragments]) => {
      const context: StyleToCssContext = {
        getFragment: (type, id) =>
          fragments.find((f) => f.type === type && f.id === id) as any,
      };
      const [css] = styleToCss(properties as StyleData, context);
      this._css$.next(css);
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._css$.complete();
      cssSubscription.unsubscribe();
    });
  }

  propertyValue<N extends StylePropertyName>(
    property: N
  ): UnsettableStyleData[N] {
    return this._state.entry(property);
  }

  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<UnsettableStyleData[N]> {
    return this._state.entry$(property);
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
    return { ...(this._state.entry("__raw") || {}) };
  }

  get raw$(): Observable<Record<string, string>> {
    return this._state.entry$("__raw").pipe(map((raw) => raw || {}));
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void {
    this._state.set(property, value);
  }

  setRaw(raw: Record<string, string>): void {
    this._state.set("__raw", raw);
  }

  get css(): CssStyleData {
    return this._css$.value;
  }

  get css$(): Observable<CssStyleData> {
    return this._css$.asObservable();
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyle({
      crdt,
      project: this.project,
      selector: this.selector,
      fragmentRegistry: this.fragmentRegistry,
      initialized: true,
    }) as this;
  }
}
