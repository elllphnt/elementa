import { BlueprintData } from "@elllphnt/elementa-base";
import { Blueprint } from "@elllphnt/elementa-core";
import { AggregatedModelList, Model } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { StatefulBlueprintNode } from "./node.js";

export class StatefulAppBlueprint
  extends Model<BlueprintData>
  implements Blueprint
{
  private _nodes: AggregatedModelList<StatefulBlueprintNode>;

  get nodes(): StatefulBlueprintNode[] {
    return this._nodes.state.items;
  }
  get nodes$(): Observable<StatefulBlueprintNode[]> {
    return this._nodes.state.items$;
  }

  constructor({ init }: { init?: BlueprintData } = {}) {
    super();

    this._nodes = new AggregatedModelList({
      init: init?.nodes ?? [],
      create: (data) => new StatefulBlueprintNode({ init: data }),
      dataRef: (data) => data.id,
      modelRef: (model) => model.id,
    });

    this.addDisposer(() => this._nodes.dispose());
  }

  node(id: string): StatefulBlueprintNode | undefined;
  node(id: string, create: true): StatefulBlueprintNode;
  node(id: string, create?: boolean): StatefulBlueprintNode | undefined {
    const existing = this._nodes.state.items.find((n) => n.id === id);
    if (existing || !create) return existing;

    const model = new StatefulBlueprintNode({
      init: { id, position: { x: 0, y: 0 } },
    });
    this._nodes.state.append([model]);
    return model;
  }

  node$(id: string): Observable<StatefulBlueprintNode | undefined>;
  node$(id: string, create: true): Observable<StatefulBlueprintNode>;
  node$(
    id: string,
    create?: boolean
  ): Observable<StatefulBlueprintNode | undefined> {
    if (create && !this.node(id)) {
      this.node(id, true);
    }

    return this._nodes.state.items$.pipe(
      map((nodes) => nodes.find((n) => n.id === id))
    );
  }

  removeNode(id: string): void {
    this._nodes.state.remove((n) => n.id === id);
  }

  get data(): BlueprintData {
    return {
      nodes: this._nodes.data,
    };
  }

  get data$(): Observable<BlueprintData> {
    return this._nodes.data$.pipe(map((nodes) => ({ nodes })));
  }

  restore(data: BlueprintData): void {
    this._nodes.restore(data.nodes ?? []);
  }
}
