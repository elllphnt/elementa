import { AppBlueprintData, BlueprintNodeData } from "@elllphnt/elementa-base";
import {
  combineLatestMerged,
  ListState,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { combineLatest, Observable } from "rxjs";
import { AppBlueprint } from "../../../../_interfaces/_.js";

export class AppBlueprintModel
  extends Model<AppBlueprintData>
  implements AppBlueprint
{
  private _nodes: ListState<BlueprintNodeData>;
  private _state: RecordState<Omit<AppBlueprintData, "nodes">>;

  get nodes(): BlueprintNodeData[] {
    return this._nodes.items;
  }
  get nodes$(): Observable<BlueprintNodeData[]> {
    return this._nodes.items$;
  }

  get data(): AppBlueprintData {
    return { ...this._state.record, nodes: this._nodes.items };
  }
  get data$(): Observable<AppBlueprintData> {
    return combineLatestMerged([
      this._state.record$,
      combineLatest({
        nodes: this._nodes.items$,
      }),
    ]);
  }

  constructor({ init }: { init: AppBlueprintData }) {
    super();

    const { nodes, ...stateData } = init;

    this._state = new RecordState<Omit<AppBlueprintData, "nodes">>({
      init: stateData,
    });

    this._nodes = new ListState<BlueprintNodeData>({
      init: nodes || [],
    });

    this.addDisposer(() => {
      this._state.dispose();
      this._nodes.dispose();
    });
  }
  setNodes(data: BlueprintNodeData[]): void {
    this._nodes.setItems(data);
  }

  restore(data: AppBlueprintData): void {
    const { nodes, ...stateData } = data;

    this._state.setRecord(stateData);
    this._nodes.setItems(nodes || []);
  }
}
