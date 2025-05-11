import {
  RawStyleData,
  StyleData,
  StylePropertyName,
  UnsettableStyleData,
  VariableStyleData,
} from "@elllphnt/elementa-base";
import { CssStyleData } from "@elllphnt/elementa-css";
import { Observable } from "rxjs";
import { Project } from "../../../infrastructure/_.js";
import { StyleFragmentRegistry } from "./style_fragment_registry.js";

export interface Style {
  project: Project;
  fragmentRegistry: StyleFragmentRegistry;
  className: string;

  // --- Property accessors ---

  /** Returns the raw value of a property (may be "unset" or varRef) */
  propertyValue<N extends StylePropertyName>(
    property: N
  ): UnsettableStyleData[N];

  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<UnsettableStyleData[N]>;

  /** Returns the value or undefined if it was "unset" (still may be a varRef) */
  propertyValueOrUndefined<N extends StylePropertyName>(
    property: N
  ): VariableStyleData[N];

  propertyValueOrUndefined$<N extends StylePropertyName>(
    property: N
  ): Observable<VariableStyleData[N]>;

  /** Returns the final runtime-resolved value (unset -> undefined, varRef resolved) */
  resolvedPropertyValue<N extends StylePropertyName>(
    property: N
  ): RawStyleData[N];

  resolvedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<RawStyleData[N]>;

  /** True if the property is explicitly defined (not inherited) */
  hasProperty(property: StylePropertyName): boolean;
  hasProperty$(property: StylePropertyName): Observable<boolean>;

  // --- Raw value accessors ---
  raw: Record<string, string>;
  raw$: Observable<Record<string, string>>;

  // --- Mutations ---
  /** Updates the value of a style property */
  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void;

  setRaw(raw: Record<string, string>): void;

  // --- Compiled CSS output (still may contain varRefs) ---
  css: CssStyleData;
  css$: Observable<CssStyleData>;
}
