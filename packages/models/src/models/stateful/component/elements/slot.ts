import { SlotElementData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { Element } from "../../../_interfaces/component/elements/element.js";
import { SlotElement } from "../../../_interfaces/component/elements/slot.js";
import { Fragment } from "../fragment.js";
import { createElementModel } from "./_create.js";
import { ElementModel } from "./element.js";

export class SlotElementModel
  extends ElementModel<SlotElementData>
  implements SlotElement
{
  private _placeholder: AggregatedModelList<ElementModel<any>>;

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

  get data(): SlotElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "slot",
      placeholder: this._placeholder.data,
    };
  }

  get data$(): Observable<SlotElementData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        placeholder: this._placeholder.data$,
      }),
    ]);
  }

  restore(data: SlotElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
      placeholder: undefined,
    });
    this._placeholder.restore(data.placeholder || []);
  }

  get placeholder(): Element[] {
    return this._placeholder.items;
  }

  get placeholder$(): Observable<Element[]> {
    return this._placeholder.items$;
  }
}
