import {
  Evaluable,
  EvaluableMap,
  Expression,
  RawStyleData,
  StyleData,
  StylePropertyName,
} from "@elllphnt/elll-element";
import { Style } from "@repo/elementa-models";
import { Disposable } from "@repo/utils";
import { Observable } from "rxjs";

/**
 * Abstract class representing an instance style.
 * Extends Disposable to allow for cleanup of resources.
 */
export abstract class InstanceStyle extends Disposable {
  static key = 0;
  static keySeed = Math.floor(Math.random() * 1000);
  readonly key = `${InstanceStyle.keySeed}-${InstanceStyle.key++}`;

  abstract get style(): Style | undefined;
  abstract get style$(): Observable<Style | undefined>;

  abstract propertyValue<N extends StylePropertyName>(
    property: N,
  ): Evaluable<StyleData[N]>;
  abstract propertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<Evaluable<StyleData[N]>>;

  abstract resolvedCascadePropertyValue<N extends StylePropertyName>(
    property: N,
  ): Evaluable<StyleData[N]>;
  abstract resolvedCascadePropertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<Evaluable<StyleData[N]>>;

  abstract resolvedPropertyValue<N extends StylePropertyName>(
    property: N,
  ): RawStyleData[N];
  abstract resolvedPropertyValue$<N extends StylePropertyName>(
    property: N,
  ): Observable<RawStyleData[N]>;

  abstract resolvedPropertyWithoutUnset<N extends StylePropertyName>(
    property: N,
  ): Exclude<RawStyleData[N], "unset">;
  abstract resolvedPropertyWithoutUnset$<N extends StylePropertyName>(
    property: N,
  ): Observable<Exclude<RawStyleData[N], "unset">>;

  abstract override(property: StylePropertyName): Expression | undefined;
  abstract override$(
    property: StylePropertyName,
  ): Observable<Expression | undefined>;

  abstract setProperty<N extends StylePropertyName>(
    property: N,
    value: EvaluableMap<StyleData>[N],
  ): void;
  abstract setOverride<N extends StylePropertyName>(
    property: N,
    value: Expression | undefined,
  ): void;
}
