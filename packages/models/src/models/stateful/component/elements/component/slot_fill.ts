import { Expression, SlotFillData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { CssStyleSheet } from "../../../../../css/_.js";
import { Component } from "../../../../_interfaces/component/component.js";
import { SlotFill } from "../../../../_interfaces/component/elements/component/slot_fill.js";
import { Element } from "../../../../_interfaces/component/elements/element.js";
import { createElementModel } from "../_create.js";
import { ElementModel } from "../element.js";

export class SlotFillModel extends Model<SlotFillData> implements SlotFill {
  private _state: RecordState<Omit<SlotFillData, "content">>;
  private _content: AggregatedModelList<ElementModel<any>>;
  private _component: Component;
  private _cssStyleSheet: CssStyleSheet;

  constructor({
    init,
    component,
    cssStyleSheet,
  }: {
    init: SlotFillData;
    component: Component;
    cssStyleSheet: CssStyleSheet;
  }) {
    super();

    this._component = component;
    this._cssStyleSheet = cssStyleSheet;

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
          fragment: component.template,
          cssStyleSheet: this._cssStyleSheet,
        }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
    });
  }

  get component(): Component {
    return this._component;
  }

  get cssStyleSheet(): CssStyleSheet {
    return this._cssStyleSheet;
  }

  get data(): SlotFillData {
    return {
      ...this._state.record,
      content: this._content.data,
    };
  }

  get data$(): Observable<SlotFillData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        content: this._content.data$,
      }),
    ]);
  }

  restore(data: SlotFillData): void {
    this._state.setRecord({
      ...data,
      content: undefined,
    });
    this._content.restore(data.content || []);
  }

  get content(): Element[] {
    return this._content.items;
  }

  get content$(): Observable<Element[]> {
    return this._content.items$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [this._cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return this._component.allStylesheets$;
  }

  get interactions(): Record<string, Expression> {
    return this._state.record.interactions || {};
  }

  get interactions$(): Observable<Record<string, Expression>> {
    return this._state.entry$("interactions");
  }

  interaction(event: string): Expression | undefined {
    return this.interactions[event];
  }

  interaction$(event: string): Observable<Expression | undefined> {
    return this.interactions$.pipe(map((interactions) => interactions[event]));
  }

  setInteraction(event: string, interaction: Expression): void {
    const interactions = { ...this.interactions };
    interactions[event] = interaction;
    this._state.set("interactions", interactions);
  }

  clearInteractions(): void {
    this._state.set("interactions", {});
  }
}
