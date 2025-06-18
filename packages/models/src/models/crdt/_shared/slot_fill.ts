import {
  ensureField,
  getOrCreateYArray,
  getOrCreateYMap,
} from "@elllphnt/crdt";
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
  AggregatedCrdtModelList,
  CrdtModel,
  CrdtRecordState,
  combineLatestArrays,
  combineLatestOrEmpty,
  keyManager,
} from "@elllphnt/elementa-utils";
import { Observable, map, of, switchMap } from "rxjs";
import * as y from "yjs";
import { CrdtElement, CrdtcreateElement } from "../elements/_element.js";
import { CrdtStylesheet } from "../style/stylesheet/stylesheet.js";

export class CrdtSlotFill extends CrdtModel<y.Map<any>> implements SlotFill {
  readonly environment: ElementEnvironment;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  // private properties
  private _state: CrdtRecordState<Omit<SlotFillData, "content">>;
  private _stylesheet: CrdtStylesheet;
  private _content: AggregatedCrdtModelList<CrdtElement>;

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
    return this._state.entry("interactions");
  }

  get interactions$(): Observable<Record<string, Expression> | undefined> {
    return this._state.entry$("interactions");
  }

  // constructor
  constructor({
    crdt,
    environment,
    cssStyleSheetTarget,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: ElementEnvironment;
    cssStyleSheetTarget?: string;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("slot-fill"), crdt });

    this.environment = environment;

    if (!initialized) {
      ensureField(crdt, "stylesheet", () => new y.Map());
      ensureField(crdt, "content", () => new y.Array());
    }

    const stylesheetMap = getOrCreateYMap(crdt, "stylesheet");
    this._stylesheet = new CrdtStylesheet({
      crdt: stylesheetMap,
      project: environment.project,
      initialized,
    });

    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: cssStyleSheetTarget || this.key,
      stylesheet: this._stylesheet,
    });

    this._state = new CrdtRecordState(crdt);

    this._content = new AggregatedCrdtModelList({
      crdt: getOrCreateYArray<y.Map<any>>(crdt, "content"),
      create: (crdt, init) =>
        CrdtcreateElement({
          crdt,
          environment,
          initialized: init && initialized,
        }),
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

  protected factory(crdt: y.Map<any>): this {
    return new CrdtSlotFill({
      crdt,
      environment: this.environment,
      cssStyleSheetTarget: this.cssStyleSheet.target,
      initialized: true,
    }) as this;
  }
}
