import { BlueprintAppStateData } from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  combineLatestMerged,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { forkJoin, map, Observable } from "rxjs";
import { AppBlueprint, BlueprintNode } from "../../../../_interfaces/_.js";
import { BlueprintNodeModel } from "./node.js";

export class AppBlueprintModel
  extends Model<BlueprintAppStateData>
  implements AppBlueprint
{
  private _nodes: AggregatedModelRecord<BlueprintNodeModel>;
  private _state: RecordState<Omit<BlueprintAppStateData, "nodes">>;

  get data(): BlueprintAppStateData {
    return { ...this._state.record, nodes: this._nodes.data };
  }
  get data$(): Observable<BlueprintAppStateData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        nodes: this._nodes.data$,
      }),
    ]);
  }

  get nodes(): BlueprintNode[] {
    return Object.values(this._nodes.state.record);
  }
  get nodes$(): Observable<BlueprintNode[]> {
    return this._nodes.state.record$.pipe(
      map((record) => Object.values(record))
    );
  }

  constructor({ init }: { init: BlueprintAppStateData }) {
    super();
    this._state = new RecordState<Omit<BlueprintAppStateData, "nodes">>({
      init,
    });

    this._nodes = new AggregatedModelRecord<BlueprintNodeModel>({
      init: init.nodes,
      create: (data) => new BlueprintNodeModel({ init: data }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._nodes.dispose();
    });
  }
  restore(data: BlueprintAppStateData): void {
    this._state.setRecord(data);
    this._nodes.restore(data.nodes);
  }
}
