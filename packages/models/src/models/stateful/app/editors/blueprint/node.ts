import { BlueprintNodeData } from "@elllphnt/elementa-base";
import { Model, PointData, RecordState } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { BlueprintNode } from "../../../../_interfaces/app/editors/blueprint/node.js";

export class BlueprintNodeModel
  extends Model<BlueprintNodeData>
  implements BlueprintNode
{
  private _state: RecordState<BlueprintNodeData>;

  get position(): PointData {
    return this._state.entry("position");
  }

  get position$(): Observable<PointData> {
    return this._state.entry$("position");
  }

  get data(): BlueprintNodeData {
    return this._state.record;
  }

  get data$(): Observable<BlueprintNodeData> {
    return this._state.record$;
  }

  constructor({ init }: { init: BlueprintNodeData }) {
    super();

    this._state = new RecordState({
      init,
    });

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  restore(data: BlueprintNodeData) {
    this._state.setRecord(data);
  }
}
