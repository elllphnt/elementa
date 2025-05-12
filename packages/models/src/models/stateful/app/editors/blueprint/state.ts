import { AppBlueprintData } from "@elllphnt/elementa-base";
import {
  AggregatedModelRecord,
  Model,
  RecordState,
  combineLatestMerged,
} from "@elllphnt/elementa-utils";
import { Observable, forkJoin, map } from "rxjs";
import { AppBlueprint } from "../../../../_interfaces/app/editors/blueprint/state.js";
import { BlueprintNodeModel } from "./node.js";

export class AppBlueprintModel
  extends Model<AppBlueprintData>
  implements AppBlueprint
{
  private _state: RecordState<Omit<AppBlueprintData, "nodes">>;
  private _nodes: AggregatedModelRecord<BlueprintNodeModel>;

  get nodes(): BlueprintNodeModel[] {
    return Object.values(this._nodes.state.record);
  }

  get nodes$(): Observable<BlueprintNodeModel[]> {
    return this._nodes.state.record$.pipe(
      map((record) => Object.values(record))
    );
  }

  get data(): AppBlueprintData {
    return {
      ...this._state.record,
      nodes: this._nodes.data,
    };
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

    this._state = new RecordState<Omit<AppBlueprintData, "nodes">>({
      init,
    });

    this._nodes = new AggregatedModelRecord<BlueprintNodeModel>({
      init: init.nodes || [],
      create: (data) => new BlueprintNodeModel({ init: data }),
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._nodes.dispose();
    });
  }

  restore(data: AppBlueprintData) {
    this._state.setRecord({ ...data, nodes: undefined });
    this._nodes.restore(data.nodes || []);
  }
}
