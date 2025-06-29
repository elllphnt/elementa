import {
  baseSelector,
  StyleData,
  StyleSheetData,
} from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import { File } from "~/project/file/file.js";
import { Project } from "~/project/project.js";
import { Style } from "./style.js";
import { StyleFragmentRegistry } from "./style_fragment_registry.js";

export class Stylesheet extends Model<RecordState<StyleSheetData>> {
  readonly project: Project;
  readonly file: File | undefined;
  readonly fragmentRegistry: StyleFragmentRegistry;

  private _styles: AggregatedModelRecord<RecordState<StyleData>, Style>;

  get className(): string {
    return this.key;
  }

  constructor({
    state,
    ...args
  }:
    | {
        state: RecordState<StyleSheetData>;
        file: File;
      }
    | {
        state: RecordState<StyleSheetData>;
        project: Project;
        initialized?: boolean;
      }) {
    super({ state });

    if ("file" in args) {
      this.file = args.file;
      this.project = args.file.project;
    } else {
      this.project = args.project;
    }

    this.fragmentRegistry = new StyleFragmentRegistry<"fragments">({
      state,
      propertyKey: "fragments",
    });

    this._styles = new AggregatedModelRecord({
      state: state.getAggregatedStateRecord("styles"),
      create: (state, key) =>
        new Style({
          state,
          project: this.project,
          selector: key,
          fragmentRegistry: this.fragmentRegistry,
        }),
    });

    this.addDisposer(() => {
      this._styles.dispose();
      this.fragmentRegistry.dispose();
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
      const state = this._styles.state.entry(selector, true);
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
          const newStyle = new Style({
            state: this._styles.state.entry(selector, true),
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

  get conditions(): Record<string, string> | undefined {
    return this.state.entry("conditions") || {};
  }

  get conditions$(): Observable<Record<string, string> | undefined> {
    return this.state.entry$("conditions");
  }

  condition(id: string): string | undefined {
    return this.conditions?.[id];
  }

  condition$(id: string): Observable<string | undefined> {
    return this.conditions$.pipe(map((conditions) => conditions?.[id]));
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
      const style = new Style({
        state: this._styles.state.entry(selector, true),
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

  setCondition(id: string, expression: string): void {
    const conditions = { ...this.conditions };
    conditions[id] = expression;
    this.state.set("conditions", conditions);
  }

  removeCondition(id: string): void {
    const conditions = { ...this.conditions };
    delete conditions[id];
    this.state.set("conditions", conditions);
  }
}
