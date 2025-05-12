import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Project } from "../../../../infrastructure/_.js";
import { VectorElement } from "../../../_interfaces/component/elements/vector.js";
import { BaseElementModel } from "./_base.js";

export class VectorElementModel
  extends BaseElementModel<VectorElementData>
  implements VectorElement
{
  // getters
  get content(): VectorNodeData[] | undefined {
    return this._state.entry("content");
  }

  get content$(): Observable<VectorNodeData[] | undefined> {
    return this._state.entry$("content");
  }

  // data getters
  get data(): VectorElementData {
    return {
      ...super._data,
      type: "vector",
    };
  }

  get data$(): Observable<VectorElementData> {
    return combineLatestMerged([super._data$]);
  }

  // constructor
  constructor({
    init,
    project,
  }: {
    init: VectorElementData;
    project: Project;
  }) {
    super({ init, project });
  }

  // restore method
  restore(data: VectorElementData): void {
    super.restore(data);
    this._state.setRecord(data);
  }
}
