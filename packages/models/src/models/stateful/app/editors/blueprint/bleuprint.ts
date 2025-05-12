import { AppBlueprintData } from "@elllphnt/elementa-base";
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
  extends Model<AppBlueprintData>
  implements AppBlueprint
{
  private _nodes: AggregatedModelRecord<BlueprintNodeModel>;
  private _state: RecordState<Omit<AppBlueprintData, "nodes">>;

  get nodes(): BlueprintNode[] {
    return Object.values(this._nodes.state.record);
  }
  get nodes$(): Observable<BlueprintNode[]> {
    return this._nodes.state.record$.pipe(
      map((record) => Object.values(record))
    );
  }

  get data(): AppBlueprintData {
    return { ...this._state.record, nodes: this._nodes.data };
  }
  get data$(): Observable<AppBlueprintData> {
    return combineLatestMerged([
      this._state.record$,
      forkJoin({
        nodes: this._nodes.data$,
      }),
    ]);
  }

  constructor({ init }: { init: AppBlueprintData }) {
    super();

    const { nodes, ...stateData } = init;

    this._state = new RecordState<Omit<AppBlueprintData, "nodes">>({
      init: stateData,
    });

    this._nodes = new AggregatedModelRecord<BlueprintNodeModel>({
      init: nodes || {},
      create: (data) => new BlueprintNodeModel({ init: data }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._nodes.dispose();
    });
  }

  restore(data: AppBlueprintData): void {
    const { nodes, ...stateData } = data;

    this._state.setRecord(stateData);
    this._nodes.restore(nodes || {});
  }
}
