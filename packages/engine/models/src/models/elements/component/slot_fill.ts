import { ElementData, Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-kernel";
import {
  combineLatestArrays,
  combineLatestOrEmpty,
} from "@elllphnt/elementa-lang-utils";
import { map, Observable, of, switchMap } from "rxjs";
import { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { StylesheetCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import { Project } from "~/project/project.js";
import { Stylesheet } from "../../style/stylesheet/stylesheet.js";
import { createElement, Element } from "../_element.js";
import { ElementEnvironment } from "../_environment.js";

export class SlotFill extends Model<RecordState<SlotFillData>> {
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  private _stylesheet: Stylesheet;
  private _content: AggregatedModelList<RecordState<ElementData>, Element>;

  // getters
  get content(): Element[] {
    return this._content.models;
  }
  get content$(): Observable<Element[]> {
    return this._content.models$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [
      this.cssStyleSheet,
      ...this.content.flatMap((c) => c.allCssStylesheets),
    ];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return combineLatestArrays([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
    ]);
  }

  get interactions(): Record<string, Expression> | undefined {
    return this.state.entry("interactions");
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this.state.entry$("interactions");
  }

  get project(): Project {
    return this.environment.project;
  }

  // constructor
  constructor({
    state,
    environment,
    cssStyleSheetTarget,
  }: {
    state: RecordState<SlotFillData>;
    environment: ElementEnvironment;
    cssStyleSheetTarget?: string;
  }) {
    super({ state });

    this.environment = environment;

    this._stylesheet = new Stylesheet({
      state: state.getRecordState("stylesheet"),
      project: environment.project,
    });

    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: cssStyleSheetTarget || this.key,
      stylesheet: this._stylesheet,
    });

    this._content = new AggregatedModelList<RecordState<ElementData>, Element>({
      state: state.getListOfRecordStates("content"),
      create: (state) =>
        createElement({
          state,
          environment: this.environment,
          initialized: true,
        }),
    });

    this.addInitializer(() => {
      this._stylesheet.initialize();
      this._content.initialize();

      this.addDisposer(() => {
        this._stylesheet.dispose();
        this.cssStyleSheet.dispose();
        this._content.dispose();
      });
    });
  }

  // methods
  interaction(event: string): Expression | undefined {
    return this.interactions?.[event];
  }

  interaction$(event: string): Observable<Expression | undefined> {
    return this.interactions$.pipe(
      map((interactions) => interactions?.[event])
    );
  }

  setInteraction(event: string, interaction: Expression): void {
    const interactions = { ...this.interactions };
    interactions[event] = interaction;
    this.state.set("interactions", interactions);
  }

  clearInteraction(event: string): void {
    const interactions = { ...this.interactions };
    delete interactions[event];
    this.state.set("interactions", interactions);
  }
}
