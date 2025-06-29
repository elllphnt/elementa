import { BlueprintData } from "@elllphnt/elementa-base";
import {
  AggregatedModelList,
  Model,
  RecordState,
} from "@elllphnt/elementa-utils";
import { Observable, distinctUntilChanged, map } from "rxjs";
import { genId } from "~/_lib/id.js";
import { BlueprintNode } from "./node.js";

export class Blueprint extends Model<RecordState<BlueprintData>> {
  private readonly _nodes: AggregatedModelList<RecordState<any>, BlueprintNode>;

  get nodes(): BlueprintNode[] {
    return this._nodes.models;
  }
  get nodes$(): Observable<BlueprintNode[]> {
    return this._nodes.models$;
  }

  constructor({ state }: { state: RecordState<BlueprintData> }) {
    super({ state });

    this._nodes = new AggregatedModelList({
      state: state.getAggregatedStateList("nodes"),
      create: (itemState) => new BlueprintNode({ state: itemState }),
    });

    this.addDisposer(() => this._nodes.dispose());
  }

  node(id: string): BlueprintNode | undefined;
  node(id: string, create: true): BlueprintNode;
  node(id: string, create?: boolean): BlueprintNode | undefined {
    const existing = this._nodes.models.find((n) => n.id === id);
    if (existing || !create) return existing;

    const nodeData = {
      id: genId(),
      position: { x: 0, y: 0 },
    };
    const node = new BlueprintNode({
      state: { ...nodeData } as any, // TODO: Fix proper state
    });
    this._nodes.add(node);
    return node;
  }

  node$(id: string): Observable<BlueprintNode | undefined>;
  node$(id: string, create: true): Observable<BlueprintNode>;
  node$(id: string, create?: boolean): Observable<BlueprintNode | undefined> {
    if (create && !this.node(id)) {
      this.node(id, true);
    }

    return this._nodes.models$.pipe(
      map((list) => (list as BlueprintNode[]).find((n) => n.id === id)),
      distinctUntilChanged()
    );
  }

  removeNode(id: string): void {
    const index = this._nodes.models.findIndex((n) => n.id === id);
    if (index >= 0) {
      this._nodes.removeAt(index, 1);
    }
  }
}
