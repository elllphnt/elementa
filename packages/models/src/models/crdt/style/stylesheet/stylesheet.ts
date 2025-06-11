import { ensureField, getOrCreateYMap } from "@elllphnt/crdt";
import { baseSelector, StyleSheetData } from "@elllphnt/elementa-base";
import { File, Project, Style, Stylesheet } from "@elllphnt/elementa-core";
import {
  AggregatedCrdtModelRecord,
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { filter, map, Observable, tap } from "rxjs";
import * as y from "yjs";
import { CrdtStyle } from "./style.js";
import { CrdtStyleFragmentRegistry } from "./style_fragment_registry.js";

export class CrdtStylesheet
  extends CrdtModel<y.Map<any>>
  implements Stylesheet
{
  readonly project: Project;
  readonly file: File | undefined;
  readonly fragmentRegistry: CrdtStyleFragmentRegistry;

  private _state: CrdtRecordState<Omit<StyleSheetData, "styles" | "fragments">>;
  private _styles: AggregatedCrdtModelRecord<CrdtStyle>;

  get className(): string {
    return this.key;
  }

  constructor({
    crdt,
    project,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    project: Project;
    file?: File;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("stylesheet"), crdt });

    this.project = project;
    this.file = file;

    if (!initialized) {
      ensureField(crdt, "fragments", () => new y.Map());
      ensureField(crdt, "styles", () => new y.Map());
      ensureField(crdt, "conditions", () => ({}));
    }

    const fragmentsMap = getOrCreateYMap(crdt, "fragments");
    this.fragmentRegistry = new CrdtStyleFragmentRegistry({
      crdt: fragmentsMap,
      initialized,
    });

    this._state = new CrdtRecordState(crdt);

    this._styles = new AggregatedCrdtModelRecord({
      crdt: getOrCreateYMap(crdt, "styles"),
      create: (crdt, key, init) =>
        new CrdtStyle({
          crdt,
          project: this.project,
          selector: key,
          fragmentRegistry: this.fragmentRegistry,
          initialized: init && initialized,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._styles.dispose();
      this.fragmentRegistry.dispose();
    });
  }

  get styles(): Record<string, Style> {
    return this._styles.models;
  }

  get styles$(): Observable<Record<string, Style>> {
    return this._styles.models$;
  }

  style(selector: string): Style | undefined;
  style(selector: string, create: true): Style;
  style(selector: string, create?: true): Style | undefined {
    let style = this._styles.models[selector];

    if (!style && create) {
      const map = new y.Map();
      style = new CrdtStyle({
        crdt: map,
        project: this.project,
        selector,
        fragmentRegistry: this.fragmentRegistry,
        initialized: true,
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
          const map = new y.Map();
          const newStyle = new CrdtStyle({
            crdt: map,
            project: this.project,
            selector,
            fragmentRegistry: this.fragmentRegistry,
            initialized: true,
          });

          this._styles.set(selector, newStyle);
        }
      }),
      filter((style) => !create || !!style)
    );
  }

  get conditions(): Record<string, string> | undefined {
    return this._state.entry("conditions") || {};
  }

  get conditions$(): Observable<Record<string, string> | undefined> {
    return this._state.entry$("conditions");
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
      const map = new y.Map();
      const style = new CrdtStyle({
        crdt: map,
        project: this.project,
        selector,
        fragmentRegistry: this.fragmentRegistry,
        initialized: true,
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
    this._state.set("conditions", conditions);
  }

  removeCondition(id: string): void {
    const conditions = { ...this.conditions };
    delete conditions[id];
    this._state.set("conditions", conditions);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStylesheet({
      crdt,
      project: this.project,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
