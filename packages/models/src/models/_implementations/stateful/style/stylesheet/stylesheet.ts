import { StyleSheetData, baseSelector } from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  Model,
  RecordState,
  combineLatestMerged,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, filter, map, tap } from "rxjs";
import { File, Project } from "~/project/_.js";
import { Style } from "../../../../_interfaces/style/stylesheet/style.js";
import { Stylesheet } from "../../../_interfaces/style/stylesheet.js";
import { StatefulStyle } from "./style.js";
import { StatefulStyleFragmentRegistry } from "./style_fragment_registry.js";

export class StatefulStylesheet
  extends Model<StyleSheetData>
  implements Stylesheet
{
  readonly project: Project;
  readonly file: File | undefined;
  readonly fragmentRegistry: StatefulStyleFragmentRegistry;

  private _state: RecordState<Omit<StyleSheetData, "styles">>;
  private _styles: AggregatedModelRecord<StatefulStyle>;

  get className(): string {
    return this.key;
  }

  get data(): StyleSheetData {
    return {
      ...this._state.record,
      styles: this._styles.data,
      fragments: this.fragmentRegistry.data,
    };
  }

  get data$(): Observable<StyleSheetData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        styles: this._styles.data$,
        fragments: this.fragmentRegistry.data$,
      }),
    ]);
  }

  constructor({
    init,
    ...rest
  }:
    | { init: StyleSheetData; project: Project }
    | { init: StyleSheetData; file: File }) {
    const { fragments, styles } = init;
    super({ key: keyManager.next("stylesheet") });

    if ("file" in rest) {
      this.project = rest.file.project;
      this.file = rest.file;
    } else {
      this.project = rest.project;
    }
    this.fragmentRegistry = new StatefulStyleFragmentRegistry({
      init: fragments || [],
    });

    this._state = new RecordState({
      init: {
        ...init,
        styles: undefined,
        project: undefined,
        fragmentRegistry: undefined,
      },
    });

    this._styles = new AggregatedModelRecord({
      init: styles || {},
      create: (data) =>
        new StatefulStyle({
          init: data,
          project: this.project,
          fragmentRegistry: this.fragmentRegistry,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._styles.dispose();
      this.fragmentRegistry.dispose();
    });
  }

  restore(data: StyleSheetData): void {
    const { styles, fragments, ...stateData } = data;
    this._state.setRecord(stateData);
    this._styles.restore(styles || {});
    this.fragmentRegistry.restore(fragments || []);
  }

  get styles(): Record<string, Style> {
    return this._styles.state.record;
  }

  get styles$(): Observable<Record<string, Style>> {
    return this._styles.state.record$;
  }

  style(selector: string): Style | undefined;
  style(selector: string, create: true): Style;
  style(selector: string, create?: true): Style | undefined {
    let style = this._styles.state.record[selector];

    if (!style && create) {
      style = new StatefulStyle({
        init: {},
        project: this.project,
        fragmentRegistry: this.fragmentRegistry,
      });

      this._styles.state.set(selector, style);
    }

    return style;
  }

  style$(selector: string): Observable<Style | undefined>;
  style$(selector: string, create: true): Observable<Style>;
  style$(selector: string, create?: true): Observable<Style | undefined> {
    return this._styles.state.record$.pipe(
      map((record) => record[selector]),
      tap((style) => {
        if (!style && create) {
          const newStyle = new StatefulStyle({
            init: {},
            project: this.project,
            fragmentRegistry: this.fragmentRegistry,
          });

          this._styles.state.set(selector, newStyle);
        }
      }),
      filter((style) => !create || !!style)
    );
  }

  get conditions(): Record<string, string> | undefined {
    return this._state.record.conditions || {};
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
    return Object.keys(this._styles.state.record);
  }
  get selectors$(): Observable<string[]> {
    return this._styles.state.record$.pipe(
      map((record) => Object.keys(record))
    );
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
    if (!this._styles.state.record[selector]) {
      const style = new StatefulStyle({
        init: {},
        project: this.project,
        fragmentRegistry: this.fragmentRegistry,
      });

      this._styles.state.set(selector, style);
    }
  }

  removeStyle(selector: string): void {
    const style = this._styles.state.remove(selector as never);
    style?.dispose();
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
}
