import type {
  ElementData,
  Expression,
  SlotFillData,
} from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList, Model } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Observable } from "rxjs";
import { combineLatest, map, of, switchMap } from "rxjs";
import type { CssStyleSheet } from "~/css/lib/stylesheet.js";
import { StyleClassCssStyleSheet } from "~/css/stylesheets/stylesheet/stylesheet.js";
import { StyleClass } from "~/models/style/stylesheet/styleclass.js";
import type { Project } from "~/project/project.js";
import type { Element } from "../_element.js";
import { createElement } from "../_element.js";
import type { ElementEnvironment } from "../_environment.js";

export class SlotFill extends Model<RecordState<SlotFillData>> {
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StyleClassCssStyleSheet;

  private _styleClass: StyleClass;
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
    return combineLatest([
      of([this.cssStyleSheet]),
      this.content$.pipe(
        switchMap((c) =>
          combineLatestOrEmpty(c.map((c) => c.allCssStylesheets$))
        ),
        map((c) => c.flat())
      ),
    ]).pipe(map(([main, content]) => [...main, ...content]));
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

    this._styleClass = new StyleClass({
      state: state.getRecordState("styleClass"),
      project: environment.project,
    });

    this.cssStyleSheet = new StyleClassCssStyleSheet({
      target: cssStyleSheetTarget || this.key,
      styleClass: this._styleClass,
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
      this._styleClass.initialize();
      this._content.initialize();

      this.addDisposer(() => {
        this._styleClass.dispose();
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
