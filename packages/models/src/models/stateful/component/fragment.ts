import { FragmentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Component } from "../../_interfaces/component/component.js";
import {
  Fragment,
  FragmentVariant,
} from "../../_interfaces/component/fragment.js";
import { DataInputModel } from "./data_input.js";
import { BaseElementModel } from "./elements/_base.js";
import { createElementModel } from "./elements/_element.js";

export class FragmentModel extends Model<FragmentData> implements Fragment {
  protected _state: RecordState<Omit<FragmentData, "content" | "params">>;
  private _content: AggregatedModelList<BaseElementModel<any>>;
  private _params: AggregatedModelList<DataInputModel>;
  private _component: Component;
  private _id: string;
  private _variant: FragmentVariant;
  private _cssStyleSheet: CssStyleSheet;
  private _slotIds: BehaviorSubject<string[]>;

  constructor({
    init,
    component,
    cssStyleSheet,
    variant,
  }: {
    init: FragmentData;
    component: Component;
    cssStyleSheet: CssStyleSheet;
    variant: FragmentVariant;
  }) {
    super();

    this._component = component;
    this._id = init.id;
    this._variant = variant;
    this._cssStyleSheet = cssStyleSheet;
    this._slotIds = new BehaviorSubject<string[]>([]);

    const { content, params, ...stateData } = init;

    this._state = new RecordState({
      init: stateData,
    });

    this._content = new AggregatedModelList({
      init: content || [],
      create: (data) =>
        createElementModel({
          init: data,
          project: component.project,
        }),
      dataRef: (d) => d.id,
      modelRef: (m) => m.id,
    });

    this._params = new AggregatedModelList({
      init: params || [],
      create: (data) =>
        new DataInputModel({
          init: data,
          component: this._component,
        }),
      dataRef: (d) => d.name,
      modelRef: (m) => m.name,
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._content.dispose();
      this._params.dispose();
      this._slotIds.complete();
    });
  }

  get id(): string {
    return this._id;
  }

  get component(): Component {
    return this._component;
  }

  get variant(): FragmentVariant {
    return this._variant;
  }

  // data getters
  get data(): FragmentData {
    return {
      ...this._state.record,
      id: this._id,
      content: this._content.data,
      params: this._params.data,
    };
  }

  get data$(): Observable<FragmentData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        id: of(this._id),
        content: this._content.data$,
        params: this._params.data$,
      }),
    ]);
  }

  // properties
  get content(): BaseElementModel<any>[] {
    return this._content.state.items;
  }

  get content$(): Observable<BaseElementModel<any>[]> {
    return this._content.state.items$;
  }

  get params(): DataInputModel[] {
    return this._params.state.items;
  }

  get params$(): Observable<DataInputModel[]> {
    return this._params.state.items$;
  }

  get allCssStylesheets(): CssStyleSheet[] {
    return [this._cssStyleSheet];
  }

  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return this._component.allStylesheets$;
  }

  get slotIds(): string[] {
    return this._slotIds.value;
  }

  get slotIds$(): Observable<string[]> {
    return this._slotIds.asObservable();
  }

  // methods
  registerSlotId(id: string): void {
    if (!this._slotIds.value.includes(id)) {
      this._slotIds.next([...this._slotIds.value, id]);
    }
  }

  unregisterSlotId(id: string): void {
    if (this._slotIds.value.includes(id)) {
      this._slotIds.next(this._slotIds.value.filter((slotId) => slotId !== id));
    }
  }

  // restore method
  restore(data: FragmentData): void {
    const { content, params, ...stateData } = data;

    this._state.setRecord(stateData);
    this._content.restore(content || []);
    this._params.restore(params || []);
  }
}
