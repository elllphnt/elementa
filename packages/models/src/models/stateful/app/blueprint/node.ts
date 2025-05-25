import { BlueprintNodeData } from "@elllphnt/elementa-base";
import { combineLatestMerged, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { BlueprintNode } from "~/models/_interfaces/_.js";
import { IdentifiableModel } from "../../_shared/_.js";

export class BlueprintNodeModel
  extends IdentifiableModel<BlueprintNodeData>
  implements BlueprintNode
{
  private _state: RecordState<Omit<BlueprintNodeData, "id">>;

  constructor({ init }: { init: BlueprintNodeData }) {
    const { id, ...rest } = init;
    super({ id });
    this._state = new RecordState({ init: rest });
    this.addDisposer(() => this._state.dispose());
  }

  get position() {
    return this._state.entry("position");
  }

  get position$(): Observable<{ x: number; y: number }> {
    return this._state.entry$("position");
  }

  setPosition(pos: { x: number; y: number }) {
    this._state.set("position", pos);
  }

  get data(): BlueprintNodeData {
    return {
      ...super._data,
      ...this._state.record,
    };
  }

  get data$(): Observable<BlueprintNodeData> {
    return combineLatestMerged([super._data$, this._state.record$]);
  }

  restore(data: BlueprintNodeData) {
    const { id, ...state } = data;
    super.restore({ id });
    this._state.setRecord(state);
  }
}
