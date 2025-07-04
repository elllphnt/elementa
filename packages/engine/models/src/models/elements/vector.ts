import type { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { BaseElement } from "./_base.js";
import type { ElementEnvironment } from "./_environment.js";

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
