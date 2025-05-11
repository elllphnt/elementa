import { StyleData, StylePropertyName } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";

export abstract class RenderedStyle {
  abstract resolvedCascadePropertyValues<N extends StylePropertyName>(
    property: N
  ): StyleData[N];
  abstract resolvedCascadePropertyValues$<N extends StylePropertyName>(
    property: N
  ): Observable<StyleData[N]>;

  abstract resolvedPropertyValue<N extends StylePropertyName>(
    property: N
  ): StyleData[N];
  abstract resolvedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<StyleData[N]>;
}
