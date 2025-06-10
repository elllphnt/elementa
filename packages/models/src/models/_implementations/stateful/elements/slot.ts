import { SlotElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { combineLatest, Observable, of } from "rxjs";
import {
  Element,
  ElementEnvironment,
  SlotElement,
} from "~/models/component/_.js";
import { BaseElementModel } from "./_base.js";
import { createElementModel, ElementModel } from "./_element.js";

export class SlotElementModel
  extends BaseElementModel<SlotElementData, "placeholder">
  implements SlotElement
{
  // private properties
  private _placeholder: AggregatedModelList<ElementModel>;

  // getters
  get placeholder(): Element[] {
    return this._placeholder.state.items;
  }

  get placeholder$(): Observable<Element[]> {
    return this._placeholder.state.items$;
  }

  // Override the slotIds property to return this element's ID
  get slotIds(): string[] {
    return [this.id];
  }

  get slotIds$(): Observable<string[]> {
    return of([this.id]);
  }

  // data getters
  get data(): SlotElementData {
    return {
      ...super._data,
      type: "slot",
      placeholder: this._placeholder.data,
    };
  }

  get data$(): Observable<SlotElementData> {
    return combineLatestMerged([
      super._data$,
      combineLatest({
        placeholder: this._placeholder.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    environment,
  }: {
    init: SlotElementData;
    environment: ElementEnvironment;
  }) {
    const { placeholder, ...elementData } = init;
    super({ init: elementData, environment });

    this._placeholder = new AggregatedModelList({
      init: placeholder || [],
      create: (data) =>
        createElementModel({
          init: data,
          environment: this.environment,
        }),
      dataRef: (d) => d.id,
      modelRef: (d) => d.id,
    });

    this.addDisposer(() => {
      this._placeholder.dispose();
    });
  }

  // restore method
  restore(data: SlotElementData): void {
    super.restore(data);
    const { placeholder } = data;
    this._placeholder.restore(placeholder || []);
  }
}
