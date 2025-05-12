import { SlotElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { BaseElement } from "../../../_interfaces/component/elements/_base.js";
import { SlotElement } from "../../../_interfaces/component/elements/slot.js";
import { Fragment } from "../fragment.js";
import { BaseElementModel } from "./_base.js";
import { createElementModel } from "./_element.js";

export class SlotElementModel
  extends BaseElementModel<SlotElementData>
  implements SlotElement
{
  // private properties
  private _placeholder: AggregatedModelList<BaseElementModel<any>>;

  // getters
  get placeholder(): BaseElement[] {
    return this._placeholder.items;
  }

  get placeholder$(): Observable<BaseElement[]> {
    return this._placeholder.items$;
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
      forkJoin({
        placeholder: this._placeholder.data$,
      }),
    ]);
  }

  // constructor
  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: SlotElementData;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({ init, fragment, cssStyleSheet });

    this._placeholder = new AggregatedModelList({
      init: init.placeholder || [],
      create: (data) =>
        createElementModel({
          init: data,
          fragment: this._fragment,
          cssStyleSheet: this._cssStyleSheet,
        }),
    });

    if (init.id) {
      fragment.registerSlotId(init.id);
    }

    this.addDisposer(() => {
      this._placeholder.dispose();
      if (this._id) {
        fragment.unregisterSlotId(this._id);
      }
    });
  }

  // restore method
  restore(data: SlotElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      placeholder: undefined,
    });
    this._placeholder.restore(data.placeholder || []);
  }
}
