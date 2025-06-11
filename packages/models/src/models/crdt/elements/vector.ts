import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { RenderingEnvironment, VectorElement } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";

export class CrdtVectorElement
  extends CrdtBaseElement<VectorElementData>
  implements VectorElement
{
  get content(): VectorNodeData[] | undefined {
    return this._state.entry("content");
  }

  get content$(): Observable<VectorNodeData[] | undefined> {
    return this._state.entry$("content");
  }

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: RenderingEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "vector", environment, initialized });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtVectorElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
