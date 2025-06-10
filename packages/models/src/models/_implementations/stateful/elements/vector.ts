import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { combineLatestMerged } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { ElementEnvironment, VectorElement } from "~/models/component/_.js";
import { StatefulBaseElement } from "./_base.js";

export class StatefulVectorElement
  extends StatefulBaseElement<VectorElementData>
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
    environment,
  }: {
    init: VectorElementData;
    environment: ElementEnvironment;
  }) {
    super({ init, environment });
  }

  // restore method
  restore(data: VectorElementData): void {
    super.restore(data);
  }
}
