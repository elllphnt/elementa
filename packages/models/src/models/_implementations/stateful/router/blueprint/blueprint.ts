import { AppBlueprintData } from "@elllphnt/elementa-base";
import { AggregatedModelList, Model } from "@elllphnt/elementa-utils";
import { Observable, map } from "rxjs";
import { AppBlueprint } from "~/models/_.js";
import { StatefulBlueprintNode } from "./node.js";

export class StatefulAppBlueprint
  extends Model<AppBlueprintData>
  implements AppBlueprint
{
  private _nodes: AggregatedModelList<StatefulBlueprintNode>;

  get nodes(): StatefulBlueprintNode[] {
    return this._nodes.state.items;
  }
  get nodes$(): Observable<StatefulBlueprintNode[]> {
    return this._nodes.state.items$;
  }

  constructor({ init }: { init?: AppBlueprintData }) {
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

  get data(): AppBlueprintData {
    return {
      nodes: this._nodes.data,
    };
  }

  get data$(): Observable<AppBlueprintData> {
    return this._nodes.data$.pipe(map((nodes) => ({ nodes })));
  }

  restore(data: AppBlueprintData): void {
    this._nodes.restore(data.nodes ?? []);
  }
}
