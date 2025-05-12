import {
  RawStyleData,
  StyleData,
  StylePropertyName,
  UnsettableStyleData,
  VariableStyleData,
} from "@elllphnt/elementa-base";
import { CssStyleData } from "@elllphnt/elementa-css";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { ProjectModel } from "../../../infrastructure/project.js";
import { Style } from "../../_interfaces/style/style.js";
import { StyleFragmentRegistry } from "../../_interfaces/style/style_fragment_registry.js";

export class StyleModel extends Model<Record<string, string>> implements Style {
  private _state: RecordState<Record<string, string>>;
  private _project: ProjectModel;
  private _fragmentRegistry: StyleFragmentRegistry;
  private _className: string;

  constructor({
    init,
    project,
    fragmentRegistry,
    className,
  }: {
    init: Record<string, string>;
    project: ProjectModel;
    fragmentRegistry: StyleFragmentRegistry;
    className: string;
  }) {
    super();

    this._project = project;
    this._fragmentRegistry = fragmentRegistry;
    this._className = className;

    this._state = new RecordState({
      init: init || {},
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  get project(): ProjectModel {
    return this._project;
  }

  get fragmentRegistry(): StyleFragmentRegistry {
    return this._fragmentRegistry;
  }

  get className(): string {
    return this._className;
  }

  get data(): Record<string, string> {
    return this._state.record;
  }

  get data$(): Observable<Record<string, string>> {
    return this._state.record$;
  }

  restore(data: Record<string, string>): void {
    this._state.setRecord(data || {});
  }

  propertyValue<N extends StylePropertyName>(
    property: N
  ): UnsettableStyleData[N] {
    return this._state.record[property] as UnsettableStyleData[N];
  }

  propertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<UnsettableStyleData[N]> {
    return this._state.record$.pipe(
      map((record) => record[property] as UnsettableStyleData[N])
    );
  }

  propertyValueOrUndefined<N extends StylePropertyName>(
    property: N
  ): VariableStyleData[N] {
    const value = this._state.record[property];
    return (value === "unset" ? undefined : value) as VariableStyleData[N];
  }

  propertyValueOrUndefined$<N extends StylePropertyName>(
    property: N
  ): Observable<VariableStyleData[N]> {
    return this._state.record$.pipe(
      map((record) => {
        const value = record[property];
        return (value === "unset" ? undefined : value) as VariableStyleData[N];
      })
    );
  }

  resolvedPropertyValue<N extends StylePropertyName>(
    property: N
  ): RawStyleData[N] {
    // Simple implementation - a more complex one would resolve variable references
    return this.propertyValueOrUndefined(property) as RawStyleData[N];
  }

  resolvedPropertyValue$<N extends StylePropertyName>(
    property: N
  ): Observable<RawStyleData[N]> {
    // Simple implementation - a more complex one would resolve variable references
    return this.propertyValueOrUndefined$(property) as Observable<
      RawStyleData[N]
    >;
  }

  hasProperty(property: StylePropertyName): boolean {
    return this._state.record[property] !== undefined;
  }

  hasProperty$(property: StylePropertyName): Observable<boolean> {
    return this._state.record$.pipe(
      map((record) => record[property] !== undefined)
    );
  }

  get raw(): Record<string, string> {
    return { ...this._state.record };
  }

  get raw$(): Observable<Record<string, string>> {
    return this._state.record$;
  }

  setProperty<N extends StylePropertyName>(
    property: N,
    value: StyleData[N]
  ): void {
    this._state.set(property, value);
  }

  setRaw(raw: Record<string, string>): void {
    this._state.setRecord(raw);
  }

  get css(): CssStyleData {
    // Convert raw properties to CSS style data
    const cssData: CssStyleData = {};

    Object.entries(this._state.record).forEach(([key, value]) => {
      if (value !== "unset" && value !== undefined) {
        cssData[key as keyof CssStyleData] = value;
      }
    });

    return cssData;
  }

  get css$(): Observable<CssStyleData> {
    return this._state.record$.pipe(
      map((record) => {
        const cssData: CssStyleData = {};

        Object.entries(record).forEach(([key, value]) => {
          if (value !== "unset" && value !== undefined) {
            cssData[key as keyof CssStyleData] = value;
          }
        });

        return cssData;
      })
    );
  }
}
