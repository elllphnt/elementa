import { Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestArrays,
  combineLatestMerged,
  combineLatestOrEmpty,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map, of, switchMap } from "rxjs";
import { CssStyleSheet, StylesheetCssStyleSheet } from "../../../css/_.js";
import { Project } from "../../../infrastructure/_.js";
import { Element } from "../../_interfaces/_.js";
import { SlotFill } from "../../_interfaces/_shared/slot_fill.js";
import {
  ElementModel,
  createElementModel,
} from "../component/elements/_element.js";
import { StylesheetModel } from "../style/stylesheet.js";

export class SlotFillModel extends Model<SlotFillData> implements SlotFill {
  readonly project: Project;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  // private properties
  private _state: RecordState<Omit<SlotFillData, "content">>;
  private _stylesheet: StylesheetModel;
  private _content: AggregatedModelList<ElementModel>;

  // getters
  get content(): Element[] {
    return this._content.state.items;
  }
  get content$(): Observable<Element[]> {
    return this._content.state.items$;
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
    return this._state.entry("interactions");
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._state.entry$("interactions");
  }

  // data getters
  get data(): SlotFillData {
    return {
      ...this._state.record,
      content: this._content.data,
      stylesheet: this._stylesheet.data,
    };
  }

  get data$(): Observable<SlotFillData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        content: this._content.data$,
        stylesheet: this._stylesheet.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    project,
    cssStyleSheetTarget,
  }: {
    init: SlotFillData;
    project: Project;
    cssStyleSheetTarget?: string;
  }) {
    super({ key: keyManager.next("slot-fill") });

    this.project = project;
    this._stylesheet = new StylesheetModel({ init: init.stylesheet, project });
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: cssStyleSheetTarget || this.key,
      stylesheet: this._stylesheet,
    });

    this._state = new RecordState({
      init: {
        ...init,
        content: undefined,
        component: undefined,
        cssStyleSheet: undefined,
      },
    });

    this._content = new AggregatedModelList({
      init: init.content || [],
      create: (data) =>
        createElementModel({
          init: data,
          project,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
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
    this._state.set("interactions", interactions);
  }
  clearInteraction(event: string): void {
    const interactions = { ...this.interactions };
    delete interactions[event];
    this._state.set("interactions", interactions);
  }

  // restore method
  restore(data: SlotFillData): void {
    this._state.setRecord(data);
    this._content.restore(data.content || []);
    this._stylesheet.restore(data.stylesheet ?? {});
  }
}
