import { BlueprintNodeData } from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { genId } from "~/_lib/id.js";
import { Identifiable } from "~/models/_shared/identifiable.js";

export class BlueprintNode extends Identifiable<BlueprintNodeData> {
  constructor({
    state,
    initialized,
  }: {
    state: RecordState<BlueprintNodeData>;
    initialized?: boolean;
  }) {
    super({ state });

    if (!initialized) {
      state.set("id", genId());
      state.set("position", { x: 0, y: 0 });
    }

    this.addDisposer(() => this.state.dispose());
  }

  get position(): { x: number; y: number } {
    return this.state.entry("position");
  }

  get position$(): Observable<{ x: number; y: number }> {
    return this.state.entry$("position");
  }

  setPosition(pos: { x: number; y: number }) {
    this.state.set("position", pos);
  }
}
