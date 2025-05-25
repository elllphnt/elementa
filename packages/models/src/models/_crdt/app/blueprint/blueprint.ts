import {
  AggregatedCrdtModelList,
  CrdtModel,
  getOrCreateYArray,
} from "@elllphnt/elementa-utils";
import { Observable, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { AppBlueprint } from "~/models/_.js";
import { CrdtBlueprintNode } from "./node.js";

export class CrdtAppBlueprint
  extends CrdtModel<y.Map<any>>
  implements AppBlueprint
{
  private readonly _nodes: AggregatedCrdtModelList<CrdtBlueprintNode>;

  constructor(crdt: y.Map<any>) {
    super({ crdt });

    const nodesArray = getOrCreateYArray<y.Map<any>>(crdt, "nodes");
    this._nodes = new AggregatedCrdtModelList({
      crdt: nodesArray,
      create: (entry) => new CrdtBlueprintNode(entry),
    });

    this.addDisposer(() => this._nodes.dispose());
  }

  node(id: string): CrdtBlueprintNode | undefined;
  node(id: string, create: true): CrdtBlueprintNode;
  node(id: string, create?: boolean): CrdtBlueprintNode | undefined {
    const existing = this._nodes.models.find((n) => n.id === id);
    if (existing || !create) return existing;

    const node = new y.Map();
    const model = new CrdtBlueprintNode(node, { id });
    this._nodes.add([model]);
    return model;
  }

  node$(id: string): Observable<CrdtBlueprintNode | undefined>;
  node$(id: string, create: true): Observable<CrdtBlueprintNode>;
  node$(
    id: string,
    create?: boolean
  ): Observable<CrdtBlueprintNode | undefined> {
    if (create && !this.node(id)) {
      this.node(id, true);
    }

    return this._nodes.models$.pipe(
      map((list) => list.find((n) => n.id === id)),
      distinctUntilChanged()
    );
  }

  removeNode(id: string): void {
    const index = this._nodes.models.findIndex((n) => n.id === id);
    if (index >= 0) {
      const crdt = this._nodes.models[index].crdt;
      const array = this._nodes.state.items;
      const idx = array.indexOf(crdt);
      if (idx >= 0) {
        this._nodes.state.removeAt(idx, 1);
      }
    }
  }
}
