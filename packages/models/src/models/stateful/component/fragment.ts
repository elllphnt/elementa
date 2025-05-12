import { FragmentData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { BehaviorSubject, forkJoin, Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Component } from "../../_interfaces/component/component.js";
import {
  Fragment,
  FragmentVariant,
} from "../../_interfaces/component/fragment.js";
import { DataInputModel } from "./data_input.js";
import { createElementModel } from "./elements/_create.js";
import { ElementModel } from "./elements/element.js";

export class FragmentModel extends Model<FragmentData> implements Fragment {
  private _state: RecordState<Omit<FragmentData, "content" | "params">>;
  private _content: AggregatedModelList<ElementModel<any>>;
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

    this._state = new RecordState({
      init: {
        ...init,
        content: undefined,
        params: undefined,
        component: undefined,
        cssStyleSheet: undefined,
      },
    });

    this._content = new AggregatedModelList({
      init: init.content || [],
      create: (data) =>
        createElementModel({
          init: data,
          fragment: this,
          cssStyleSheet: this._cssStyleSheet,
        }),
    });

    this._params = new AggregatedModelList({
      init: init.params || [],
      create: (data) =>
        new DataInputModel({
          init: data,
          component: this._component,
        }),
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
        content: this._content.data$,
        params: this._params.data$,
      }),
    ]);
  }

  restore(data: FragmentData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      content: undefined,
      params: undefined,
    });
    this._content.restore(data.content || []);
    this._params.restore(data.params || []);
  }

  get content(): ElementModel<any>[] {
    return this._content.items;
  }

  get content$(): Observable<ElementModel<any>[]> {
    return this._content.items$;
  }

  get params(): DataInputModel[] {
    return this._params.items;
  }

  get params$(): Observable<DataInputModel[]> {
    return this._params.items$;
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
}
