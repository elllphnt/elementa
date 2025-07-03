import type { BlueprintData } from "@elllphnt/elementa-base";
import { genId } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { AggregatedModelList } from "@elllphnt/elementa-kernel";
import type { Observable } from "rxjs";
import { distinctUntilChanged, map } from "rxjs";
import type { Project } from "~/project/project.js";
import { ProjectModel } from "../project.js";
import { BlueprintNode } from "./node.js";

export class Blueprint extends ProjectModel<RecordState<BlueprintData>> {
  private readonly _nodes: AggregatedModelList<RecordState<any>, BlueprintNode>;

  get nodes(): BlueprintNode[] {
    return this._nodes.models;
  }
  get nodes$(): Observable<BlueprintNode[]> {
    return this._nodes.models$;
  }

  constructor({
    state,
    project,
  }: {
    state: RecordState<BlueprintData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    this._nodes = new AggregatedModelList({
      state: state.getListOfRecordStates("nodes"),
      create: (itemState) =>
        new BlueprintNode({ state: itemState, project, initialized: true }),
    });

    this.addInitializer(() => {
      this._nodes.initialize();

      this.addDisposer(() => {
        this._nodes.dispose();
      });
    });
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
      project: this.project,
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
