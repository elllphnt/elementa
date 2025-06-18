import { Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  CssStyleSheet,
  Element,
  ElementEnvironment,
  File,
  Project,
  SlotFill,
  StylesheetCssStyleSheet,
} from "@elllphnt/elementa-core";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestArrays,
  combineLatestMerged,
  combineLatestOrEmpty,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, combineLatest, map, of, switchMap } from "rxjs";
import {
  StatefulElement,
  StatefulcreateElement,
} from "../elements/_element.js";
import { StatefulStylesheet } from "../style/stylesheet/stylesheet.js";

export class StatefulSlotFill extends Model<SlotFillData> implements SlotFill {
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  // private properties
  private _state: RecordState<Omit<SlotFillData, "content">>;
  private _stylesheet: StatefulStylesheet;
  private _content: AggregatedModelList<StatefulElement>;

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
      combineLatest({
        content: this._content.data$,
        stylesheet: this._stylesheet.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    environment,
    cssStyleSheetTarget,
  }: {
    init: SlotFillData;
    environment: ElementEnvironment;
    cssStyleSheetTarget?: string;
  }) {
    super({ key: keyManager.next("slot-fill") });

    this.environment = environment;
    this._stylesheet = new StatefulStylesheet({
      init: init.stylesheet || {},
      project: environment.project,
    });
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
        StatefulcreateElement({
          init: data,
          environment,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
    });
  }
  project: Project<File>;

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
