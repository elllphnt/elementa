import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import { ElementEnvironment } from "./_environment.js";

export class VectorElement extends BaseElement<VectorElementData> {
  get content(): VectorNodeData[] | undefined {
    return this.state.entry("content");
  }

  get content$(): Observable<VectorNodeData[] | undefined> {
    return this.state.entry$("content");
  }

  constructor({
    state,
    environment,
  }: {
    state: RecordState<VectorElementData>;
    environment: ElementEnvironment;
  }) {
    super({ state, environment, type: "vector" });
  }

  setContent(content: VectorNodeData[] | undefined): void {
    this.state.set("content", content);
  }
}
