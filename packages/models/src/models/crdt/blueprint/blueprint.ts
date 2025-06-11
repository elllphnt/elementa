import { getOrCreateYArray } from "@elllphnt/crdt";
import { Blueprint, BlueprintNode } from "@elllphnt/elementa-core";
import { AggregatedCrdtModelList, CrdtModel } from "@elllphnt/elementa-utils";
import { Observable, distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { CrdtBlueprintNode } from "./node.js";

export class CrdtBlueprint extends CrdtModel<y.Map<any>> implements Blueprint {
  private readonly _nodes: AggregatedCrdtModelList<CrdtBlueprintNode>;

  get nodes(): BlueprintNode[] {
    return this._nodes.models;
  }
  get nodes$(): Observable<BlueprintNode[]> {
    return this._nodes.models$;
  }

  constructor(
    crdt: y.Map<any>,
    { initialized }: { initialized?: boolean } = {}
  ) {
    super({ crdt });

    const nodesArray = getOrCreateYArray<y.Map<any>>(crdt, "nodes");
    this._nodes = new AggregatedCrdtModelList({
      crdt: nodesArray,
      create: (entry, init) =>
        new CrdtBlueprintNode(entry, { initialized: init && initialized }),
    });

    this.addDisposer(() => this._nodes.dispose());
  }

  node(id: string): CrdtBlueprintNode | undefined;
  node(id: string, create: true): CrdtBlueprintNode;
  node(id: string, create?: boolean): CrdtBlueprintNode | undefined {
    const existing = this._nodes.models.find((n) => n.id === id);
    if (existing || !create) return existing;

    const node = new y.Map();
    node.set("id", id);
    node.set("position", { x: 0, y: 0 });
    const model = new CrdtBlueprintNode(node, { initialized: true });
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

  protected factory(crdt: y.Map<any>): this {
    return new CrdtBlueprint(crdt, { initialized: true }) as this;
  }
}
