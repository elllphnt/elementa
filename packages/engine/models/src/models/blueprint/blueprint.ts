import { BlueprintData, genId } from "@elllphnt/elementa-base";
import { AggregatedModelList, RecordState } from "@elllphnt/elementa-kernel";
import { Observable, distinctUntilChanged, map } from "rxjs";
import { Project } from "~/project/project.js";
import { modelsLogger } from "../../loggers.js";
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
    initialized,
  }: {
    state: RecordState<BlueprintData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });

    modelsLogger.info("Creating blueprint", {
      projectId: project.id,
      initialized: initialized ?? false,
    });

    this._nodes = new AggregatedModelList({
      state: state.getListOfRecordStates("nodes"),
      create: (itemState) =>
        new BlueprintNode({ state: itemState, project, initialized: true }),
    });

    this.addInitializer(() => {
      modelsLogger.debug("Initializing blueprint nodes", {
        projectId: project.id,
        nodeCount: this._nodes.models.length,
      });
      this._nodes.initialize();

      this.addDisposer(() => {
        modelsLogger.debug("Disposing blueprint model", {
          projectId: project.id,
          nodeCount: this._nodes.models.length,
        });
        this._nodes.dispose();
      });
    });
  }

  node(id: string): BlueprintNode | undefined;
  node(id: string, create: true): BlueprintNode;
  node(id: string, create?: boolean): BlueprintNode | undefined {
    const existing = this._nodes.models.find((n) => n.id === id);
    if (existing || !create) return existing;

    modelsLogger.debug("Creating new blueprint node", {
      nodeId: id,
      projectId: this.project.id,
      totalNodes: this._nodes.models.length,
    });

    const nodeData = {
      id: genId(),
      position: { x: 0, y: 0 },
    };
    const node = new BlueprintNode({
      state: { ...nodeData } as any, // TODO: Fix proper state
      project: this.project,
    });
    this._nodes.add(node);

    modelsLogger.debug("Blueprint node created and added", {
      nodeId: id,
      projectId: this.project.id,
      totalNodes: this._nodes.models.length,
    });

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
      modelsLogger.debug("Removing blueprint node", {
        nodeId: id,
        nodeIndex: index,
        projectId: this.project.id,
        totalNodesBefore: this._nodes.models.length,
      });
      this._nodes.removeAt(index, 1);
      modelsLogger.debug("Blueprint node removed", {
        nodeId: id,
        projectId: this.project.id,
        totalNodesAfter: this._nodes.models.length,
      });
    } else {
      modelsLogger.warn("Attempted to remove non-existent blueprint node", {
        nodeId: id,
        projectId: this.project.id,
        totalNodes: this._nodes.models.length,
      });
    }
  }
}
