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
    initialized,
  }: {
    state: RecordState<VectorElementData>;
    environment: ElementEnvironment;
    initialized?: boolean;
  }) {
    super({ state, environment, type: "vector", initialized });
  }

  setContent(content: VectorNodeData[] | undefined): void {
    this.state.set("content", content);
  }
}
