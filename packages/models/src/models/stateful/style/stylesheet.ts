import { StylesheetData } from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { ProjectModel } from "../../../infrastructure/project.js";
import { Style } from "../../_interfaces/style/style.js";
import { StyleFragmentRegistry } from "../../_interfaces/style/style_fragment_registry.js";
import { Stylesheet } from "../../_interfaces/style/stylesheet.js";
import { StyleModel } from "./style.js";

export class StylesheetModel
  extends Model<StylesheetData>
  implements Stylesheet
{
  private _state: RecordState<Omit<StylesheetData, "styles">>;
  private _styles: AggregatedModelRecord<StyleModel>;
  private _project: ProjectModel;
  private _fragmentRegistry: StyleFragmentRegistry;

  constructor({
    init,
    project,
  }: {
    init: StylesheetData;
    project: ProjectModel;
  }) {
    super();

    this._project = project;
    this._fragmentRegistry = fragmentRegistry;

    this._state = new RecordState({
      init: {
        ...init,
        styles: undefined,
        project: undefined,
        fragmentRegistry: undefined,
      },
    });

    this._styles = new AggregatedModelRecord({
      init: init.styles || {},
      create: (data, selector) =>
        new StyleModel({
          init: data,
          project: this._project,
          fragmentRegistry: this._fragmentRegistry,
          className: selector,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._styles.dispose();
    });
  }

  get project(): ProjectModel {
    return this._project;
  }

  get fragmentRegistry(): StyleFragmentRegistry {
    return this._fragmentRegistry;
  }

  get className(): string {
    return this._state.record.className || "";
  }

  get data(): StylesheetData {
    return {
      ...this._state.record,
      styles: this._styles.data,
    };
  }

  get data$(): Observable<StylesheetData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        styles: this._styles.data$,
      }),
    ]);
  }

  restore(data: StylesheetData): void {
    this._state.setRecord({
      ...data,
      styles: undefined,
    });
    this._styles.restore(data.styles || {});
  }

  get styles(): Record<string, Style> {
    return this._styles.state.record;
  }

  get styles$(): Observable<Record<string, Style>> {
    return this._styles.state.record$;
  }

  style<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? Style : Style | undefined {
    if (this._styles.state.record[selector]) {
      return this._styles.state.record[selector] as any;
    }

    if (create) {
      const style = new StyleModel({
        init: {},
        project: this._project,
        fragmentRegistry: this._fragmentRegistry,
        className: selector,
      });

      this._styles.state.set(selector, style);
      return style as any;
    }

    return undefined as any;
  }

  style$<C extends true | undefined>(
    selector: string,
    create?: C
  ): C extends true ? Observable<Style> : Observable<Style | undefined> {
    if (create) {
      return this._styles.state.record$.pipe(
        map((record) => {
          if (record[selector]) {
            return record[selector];
          }

          const style = new StyleModel({
            init: {},
            project: this._project,
            fragmentRegistry: this._fragmentRegistry,
            className: selector,
          });

          this._styles.state.set(selector, style);
          return style;
        })
      ) as any;
    }

    return this._styles.state.record$.pipe(
      map((record) => record[selector])
    ) as any;
  }

  get conditions(): Record<string, string> {
    return this._state.record.conditions || {};
  }

  get conditions$(): Observable<Record<string, string>> {
    return this._state.entry$("conditions");
  }

  condition(id: string): string | undefined {
    return this.conditions[id];
  }

  condition$(id: string): Observable<string | undefined> {
    return this.conditions$.pipe(map((conditions) => conditions[id]));
  }

  get selectors(): string[] {
    return Object.keys(this._styles.state.record);
  }

  get selectors$(): Observable<string[]> {
    return this._styles.state.record$.pipe(
      map((record) => Object.keys(record))
    );
  }

  baseStyle<C extends true | undefined>(
    create?: C
  ): C extends true ? Style : Style | undefined {
    return this.style("base", create as any);
  }

  baseStyle$<C extends true | undefined>(
    create?: C
  ): C extends true ? Observable<Style> : Observable<Style | undefined> {
    return this.style$("base", create as any);
  }

  addStyle(selector: string): void {
    if (!this._styles.state.record[selector]) {
      const style = new StyleModel({
        init: {},
        project: this._project,
        fragmentRegistry: this._fragmentRegistry,
        className: selector,
      });

      this._styles.state.set(selector, style);
    }
  }

  removeStyle(selector: string): void {
    if (this._styles.state.record[selector]) {
      this._styles.state.delete(selector);
    }
  }

  setCondition(id: string, expression: string): void {
    const conditions = { ...this.conditions };
    conditions[id] = expression;
    this._state.set("conditions", conditions);
  }

  removeCondition(id: string): void {
    if (this.conditions[id]) {
      const conditions = { ...this.conditions };
      delete conditions[id];
      this._state.set("conditions", conditions);
    }
  }
}
