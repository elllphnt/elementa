import {
  baseSelector,
  Evaluable,
  Expression,
  isExpression,
  isVarRef,
  RawStyleData,
  StyleData,
  StyleModifierData,
  StylePropertyName,
} from "@elllphnt/elll-element";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import { InstanceStyle } from "~/src/style/style";
import { SlotInstance } from "./slot";

export class SlotInstanceStyle extends InstanceStyle {
  readonly slot: SlotInstance;

  readonly _selectorString$ = new BehaviorSubject<string>(baseSelector);

  get stylesheet() {
    return this.slot.fill?.stylesheet;
  }
  get stylesheet$() {
    return this.slot.fill$.pipe(map((fill) => fill?.stylesheet));
  }

  get styleOverridesMap() {
    return this.slot.entity.styleOverridesMap;
  }
  get environment() {
    return this.slot.environment;
  }

  get namespace() {
    return this.environment.namespace;
  }
  get namespace$() {
    return this.environment.namespace$;
  }

  get modifiers(): StyleModifierData[] {
    return this.environment.styleModifiers;
  }
  get modifiers$(): Observable<StyleModifierData[]> {
    return this.environment.styleModifiers$;
  }

  get selectorString() {
    return this._selectorString$.value;
  }
  get selectorString$() {
    return this._selectorString$.asObservable();
  }

  override<N extends StylePropertyName>(
    property: N,
  ): Expression<StyleData[N]> | undefined {
    return this.styleOverridesMap.override(property as any) as any;
  }
  override$<N extends StylePropertyName>(
    property: N,
  ): Observable<Expression<StyleData[N]>> {
    return this.styleOverridesMap.override$(property as any) as any;
  }

  propertyValue<N extends StylePropertyName>(
    property: N,
  ): Evaluable<StyleData[N]> {
    const override = this.override(property);
    if (override) {
      return override as any;
    } else {
      return this.stylesheet
        ?.style(this.selectorString, undefined)
        ?.propertyValue(property) as Evaluable<StyleData[N]>;
    }
  }
  propertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<Evaluable<StyleData[N]>> {
    return this.override$(property).pipe(
      switchMap((override) => {
        if (override) {
          return of(override);
        } else {
          return this.selectorString$.pipe(
            switchMap((selector) =>
              this.stylesheet$.pipe(
                switchMap(
                  (stylesheet) =>
                    stylesheet?.style$(selector, undefined) ?? of(undefined),
                ),
              ),
            ),
            switchMap(
              (style) => style?.propertyValue$(property) ?? of(undefined),
            ),
          ) as Observable<Evaluable<StyleData[N]>>;
        }
      }),
    );
  }

  // inherited

  inheritedPropertyValue<N extends StylePropertyName>(
    property: N,
  ): Evaluable<StyleData[N]> {
    return undefined as any;
  }
  inheritedPropertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<Evaluable<StyleData[N]>> {
    return of(undefined) as any;
  }

  // cascade

  resolvedCascadePropertyValue<N extends StylePropertyName>(
    property: N,
  ): Evaluable<StyleData[N]> {
    const style = this.stylesheet?.style(this.selectorString, undefined);
    if (style) {
      const value = style.propertyValue(property);
      if (value !== undefined) {
        return value;
      }
    }
    return this.inheritedPropertyValue(property) as any;
  }
  resolvedCascadePropertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<Evaluable<StyleData[N]>> {
    return this.selectorString$.pipe(
      switchMap((selector) =>
        this.stylesheet$.pipe(
          switchMap(
            (stylesheet) =>
              stylesheet?.style$(selector, undefined) ?? of(undefined),
          ),
        ),
      ),
      switchMap((style) => style?.propertyValue$(property) ?? of(undefined)),
      switchMap((value) =>
        value !== undefined
          ? of(value)
          : this.inheritedPropertyValue$(property),
      ),
    );
  }

  resolvedPropertyValue<N extends StylePropertyName>(
    property: N,
  ): RawStyleData[N] {
    const cascaded = this.resolvedCascadePropertyValue(property);
    if (isExpression(cascaded)) {
      return this.namespace.resolveExpression(cascaded);
    } else if (isVarRef(cascaded)) {
      // return this.environment.theme?.value(cascaded.__var);
    } else {
      return cascaded as any;
    }
  }
  resolvedPropertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<RawStyleData[N]> {
    return this.resolvedCascadePropertyValue$(property).pipe(
      switchMap((cascaded: any) => {
        if (isExpression(cascaded)) {
          return this.namespace$.pipe(
            switchMap((namespace) => of(namespace.resolveExpression(cascaded))),
          );
        } else if (isVarRef(cascaded)) {
          return of(undefined);
          // return this.environment.theme$.pipe(
          //   switchMap(
          //     (theme) => theme?.value$(cascaded.__var) ?? of(undefined),
          //   ),
          // );
        } else {
          return of(cascaded as any);
        }
      }),
    );
  }

  resolvedPropertyWithoutUnset<N extends StylePropertyName>(
    property: N,
  ): Exclude<RawStyleData[N], "unset"> {
    const value = this.resolvedPropertyValue(property);
    if (value === "unset") {
      return undefined as any;
    } else {
      return value as any;
    }
  }
  resolvedPropertyWithoutUnset$<N extends StylePropertyName>(
    property: N,
  ): Observable<Exclude<RawStyleData[N], "unset">> {
    return this.resolvedPropertyValue$(property).pipe(
      map((value) => {
        if (value === "unset") {
          return undefined as any;
        } else {
          return value as any;
        }
      }),
    );
  }

  constructor({ slot }: { slot: SlotInstance }) {
    super();
    this.slot = slot;

    const selectorStringSubscription = this.modifiers$
      .pipe(
        switchMap((modifiers) => {
          if (modifiers.length) {
            return this.slot.entity.component.project.styleManager.modifiersToElllSelector$(
              modifiers,
            );
          } else {
            return of(baseSelector);
          }
        }),
      )
      .subscribe(this._selectorString$);

    this.addDisposer(() => {
      selectorStringSubscription.unsubscribe();
      this._selectorString$.complete();
    });
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N],
  ): void {
    this.stylesheet
      ?.style(this.selectorString, true)
      .setProperty(property as any, value as any);
  }

  setOverride<N extends StylePropertyName>(
    property: N,
    value: Expression | undefined,
  ): void {
    this.styleOverridesMap.setOverride(property as any, value as any);
  }
}
