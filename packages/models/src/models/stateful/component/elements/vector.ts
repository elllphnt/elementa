import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../../css/_.js";
import { VectorElement } from "../../../_interfaces/component/elements/vector.js";
import { Fragment } from "../fragment.js";
import { ElementModel } from "./element.js";

export class VectorElementModel
  extends ElementModel<VectorElementData>
  implements VectorElement
{
  constructor({
    init,
    fragment,
    cssStyleSheet,
  }: {
    init: VectorElementData;
    fragment: Fragment;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({ init, fragment, cssStyleSheet });
  }

  get data(): VectorElementData {
    return {
      ...this._state.record,
      id: this._id,
      type: "vector",
    };
  }

  get data$(): Observable<VectorElementData> {
    return combineLatestMerged([this._state.record$]);
  }

  restore(data: VectorElementData): void {
    this._state.setRecord({
      ...data,
      id: undefined,
    });
  }

  get content(): VectorNodeData[] | undefined {
    return this._state.record.content;
  }

  get content$(): Observable<VectorNodeData[] | undefined> {
    return this._state.entry$("content");
  }
}
