import type { StyleClassData, StyleData } from "@elllphnt/elementa-base";
import { baseSelector } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelRecord } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { filter, map, tap } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import type { Project } from "~/project/project.js";
import { Style } from "./style.js";
import { StyleFragmentRegistry } from "./style_fragment_registry.js";

export class StyleClass extends ProjectModel<RecordState<StyleClassData>> {
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _styles: AggregatedModelRecord<RecordState<StyleData>, Style>;

  get className(): string {
    return this.key;
  }

  constructor({
    state,
    project,
  }: {
    state: RecordState<StyleClassData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    this.fragmentRegistry = new StyleFragmentRegistry<"fragments">({
      state,
      propertyKey: "fragments",
    });

    this._styles = new AggregatedModelRecord({
      state: state.getRecordOfRecordStates("styles"),
      create: (state, key) =>
        new Style({
          state,
          project: this.project,
          selector: key,
          fragmentRegistry: this.fragmentRegistry,
        }),
    });

    this.addInitializer(() => {
      this.fragmentRegistry.initialize();
      this._styles.initialize();

      this.addDisposer(() => {
        this._styles.dispose();
        this.fragmentRegistry.dispose();
      });
    });
  }

  get styles(): Record<string, Style | undefined> {
    return this._styles.models;
  }

  get styles$(): Observable<Record<string, Style | undefined>> {
    return this._styles.models$;
  }

  style(selector: string): Style | undefined;
  style(selector: string, create: true): Style;
  style(selector: string, create?: true): Style | undefined {
    let style = this._styles.models[selector];

    if (!style && create) {
      const state = this.state.backend.createRecordState<StyleData>();
      style = new Style({
        state,
        project: this.project,
        selector,
        fragmentRegistry: this.fragmentRegistry,
      });

      this._styles.set(selector, style);
    }

    return style;
  }

  style$(selector: string): Observable<Style | undefined>;
  style$(selector: string, create: true): Observable<Style>;
  style$(selector: string, create?: true): Observable<Style | undefined> {
    return this._styles.models$.pipe(
      map((record) => record[selector]),
      tap((style) => {
        if (!style && create) {
          const state = this.state.backend.createRecordState<StyleData>();
          const newStyle = new Style({
            state,
            project: this.project,
            selector,
            fragmentRegistry: this.fragmentRegistry,
          });

          this._styles.set(selector, newStyle);
        }
      }),
      filter((style) => !create || !!style)
    );
  }

  get selectors(): string[] {
    return Object.keys(this._styles.models);
  }

  get selectors$(): Observable<string[]> {
    return this._styles.models$.pipe(map((record) => Object.keys(record)));
  }

  baseStyle(): Style | undefined;
  baseStyle(create: true): Style;
  baseStyle(create?: true): Style | undefined {
    return this.style(baseSelector, create as any);
  }

  baseStyle$(): Observable<Style | undefined>;
  baseStyle$(create: true): Observable<Style>;
  baseStyle$(create?: true): Observable<Style | undefined> {
    return this.style$(baseSelector, create as any);
  }

  addStyle(selector: string): void {
    if (!this._styles.models[selector]) {
      const state = this.state.backend.createRecordState<StyleData>();
      const style = new Style({
        state,
        project: this.project,
        selector,
        fragmentRegistry: this.fragmentRegistry,
      });

      this._styles.set(selector, style);
    }
  }

  removeStyle(selector: string): void {
    this._styles.remove(selector);
  }
}
