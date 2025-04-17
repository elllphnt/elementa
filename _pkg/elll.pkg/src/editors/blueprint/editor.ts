import dagre from "@dagrejs/dagre";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { Edge } from "@xyflow/react";
import { BehaviorSubject, map, Observable, of, switchMap } from "rxjs";
import {
  getElllWorkspaceElementaProject,
  getElllWorkspaceElementaProject$,
} from "~/src/modules/elementa/project/_lib";
import { NodeData } from "~/src/modules/elementa/project/blueprint/blueprint";
import { IElll } from "~/src/types/elll";

export type BlueprintEditorState = {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  selection: {
    nodes: string[];
    edges: string[];
  };
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class BlueprintEditor extends Disposable {
  elll: IElll;

  private _state$ = new BehaviorSubject<BlueprintEditorState>({
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    selection: {
      nodes: [],
      edges: [],
    },
  });
  private _egdes$ = new BehaviorSubject<Edge[]>([]);
  private _nodeMenuId$ = new BehaviorSubject<string | undefined>(undefined);
  private _rootDom: HTMLElement | undefined = undefined;
  private _nodeDoms: Map<string, HTMLElement | undefined> = new Map();

  get project() {
    return getElllWorkspaceElementaProject(this.elll);
  }
  get project$() {
    return getElllWorkspaceElementaProject$(this.elll);
  }

  get nodeMenuId() {
    return this._nodeMenuId$.value;
  }
  get nodeMenuId$() {
    return this._nodeMenuId$.asObservable();
  }

  get app() {
    return this.project?.app;
  }
  get app$() {
    return this.project$?.pipe(map((project) => project?.app));
  }

  get blueprint() {
    return this.project?.blueprint;
  }
  get blueprint$() {
    return this.project$?.pipe(map((project) => project?.blueprint));
  }

  get nodes() {
    return this.blueprint?.nodes || {};
  }
  get nodes$() {
    return this.blueprint$.pipe(
      switchMap((blueprint) => blueprint?.nodes$ || of({})),
    ) as Observable<Record<string, NodeData>>;
  }

  get edges() {
    return this._egdes$.value;
  }
  get edges$() {
    return this._egdes$.asObservable();
  }

  get routes() {
    return this.app?.routes || [];
  }
  get routes$() {
    return this.app$?.pipe(switchMap((app) => app?.routes$ || of([])));
  }

  route(id: string) {
    return this.app?.route(id);
  }
  route$(id: string) {
    return this.app$?.pipe(
      switchMap((app) => app?.route$(id) || of(undefined)),
    );
  }

  get state(): BlueprintEditorState {
    return this._state$.getValue();
  }
  get state$() {
    return this._state$.asObservable();
  }

  isNodeSelected(nodeId: string): boolean {
    return this.state.selection.nodes.includes(nodeId);
  }
  isNodeSelected$(nodeId: string): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.selection.nodes.includes(nodeId)),
    );
  }

  constructor({ elll }: { elll: IElll }) {
    super();
    this.elll = elll;

    // update routes and parentIds change
    const routesSubscription = this.routes$
      .pipe(
        switchMap((routes) =>
          combineLatestOrEmpty(
            routes.map((route) =>
              route.parentId$.pipe(map((parentId) => ({ route, parentId }))),
            ),
          ),
        ),
      )
      .subscribe((routes) => {
        let edges: Edge[] = [];

        for (const _route of routes) {
          const { route, parentId } = _route;
          const { id } = route;

          if (parentId) {
            const edge: Edge = {
              id: `${parentId}-${id}`,
              source: parentId,
              target: id,
              type: "smoothstep",
            };
            edges.push(edge);
          }
        }

        this._egdes$.next(edges);
      });

    this.addDisposer(() => {
      routesSubscription.unsubscribe();
    });
  }

  addRoute({
    childId,
    parentId,
    node,
  }: {
    childId?: string;
    parentId?: string;
    node: NodeData;
  }) {
    const route = this.app?.createRoute();
    if (!route) return;
    if (parentId) {
      route.update({ parentId });
    }
    if (childId) {
      this.app?.route(childId)?.update({ parentId: route.id });
    }
    this.blueprint?.updateNode(route.id, node);
    route.app.addRoute(route);
  }

  public setState(newState: Partial<BlueprintEditorState>) {
    this._state$.next({
      ...this.state,
      ...newState,
    });
  }

  // dom methods

  setNodeDom(nodeId: string, dom: HTMLElement | undefined) {
    this._nodeDoms.set(nodeId, dom);
  }
  setRootDom(dom: HTMLElement | undefined) {
    this._rootDom = dom;
  }

  // viewport methods

  getRootWindowRect(): Rect | undefined {
    if (!this._rootDom) return;
    const rect = this._rootDom.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }
  getNodeWindowRect(nodeId: string): Rect | undefined {
    const dom = this._nodeDoms.get(nodeId);
    if (!dom) return;
    const rect = dom.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }
  getNodeViewportRect(nodeId: string): Rect | null {
    const nodeWindowRect = this.getNodeWindowRect(nodeId);
    const rootWindowRect = this.getRootWindowRect();
    if (!nodeWindowRect || !rootWindowRect) return null;
    return {
      x: nodeWindowRect.x - rootWindowRect.x,
      y: nodeWindowRect.y - rootWindowRect.y,
      width: nodeWindowRect.width,
      height: nodeWindowRect.height,
    };
  }
  getNodeContentRect(nodeId: string): Rect | null {
    const nodeViewportRect = this.getNodeViewportRect(nodeId);
    const viewport = this.state.viewport;
    if (!nodeViewportRect) return null;
    return {
      x: (nodeViewportRect.x - viewport.x) / viewport.zoom,
      y: (nodeViewportRect.y - viewport.y) / viewport.zoom,
      width: nodeViewportRect.width / viewport.zoom,
      height: nodeViewportRect.height / viewport.zoom,
    };
  }

  windowToViewportPosition(position: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const rootWindowRect = this.getRootWindowRect();
    if (!rootWindowRect) return position;
    return {
      x: position.x - rootWindowRect.x,
      y: position.y - rootWindowRect.y,
    };
  }
  viewportToContentPosition(position: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const viewport = this.state.viewport;
    return {
      x: (position.x - viewport.x) / viewport.zoom,
      y: (position.y - viewport.y) / viewport.zoom,
    };
  }
  windowToContentPosition(position: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    const viewportPosition = this.windowToViewportPosition(position);
    return this.viewportToContentPosition(viewportPosition);
  }

  // selection methods

  select(
    { nodes, egdes }: { nodes?: string[]; egdes?: string[] },
    toogle: boolean = false,
  ) {
    if (toogle) {
      const nodes: Set<string> = new Set(this.state.selection.nodes);
      const egdes: Set<string> = new Set(this.state.selection.edges);
      for (const node of nodes) {
        if (nodes.has(node)) {
          nodes.delete(node);
        } else {
          nodes.add(node);
        }
      }
      for (const edge of egdes) {
        if (egdes.has(edge)) {
          egdes.delete(edge);
        } else {
          egdes.add(edge);
        }
      }
      this.setState({
        selection: {
          nodes: Array.from(nodes),
          edges: Array.from(egdes),
        },
      });
    } else {
      this.setState({
        selection: {
          nodes: nodes || [],
          edges: egdes || [],
        },
      });
    }
  }

  // layout methods

  autoLayout() {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    // use routes to create graph nodes
    const nodes = this.routes.map((route) => {
      const wrect = this.getNodeWindowRect(route.id);
      const vrect = this.getNodeViewportRect(route.id);
      const rect = this.getNodeContentRect(route.id);
      console.log({ rect, vrect, wrect, v: this.state.viewport, id: route.id });
      const defaultSize = { width: 100, height: 50 };
      let size = defaultSize;
      if (rect) {
        size = {
          width: rect.width,
          height: rect.height,
        };
      }
      g.setNode(route.id, size);
      return { id: route.id };
    });

    // add each edge
    this.edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // update node positions adjusted to center nodes
    nodes.forEach((node) => {
      const pos = g.node(node.id);
      if (pos) {
        this.blueprint?.updateNode(node.id, {
          position: { x: pos.x - pos.width / 2, y: pos.y },
        });
      }
    });
  }
  setNodeMenuId(nodeId: string | undefined) {
    this._nodeMenuId$.next(nodeId);
  }

  // manipulation methods

  public deleteSelection(): void {
    const { nodes, edges: egdes } = this.state.selection;
    const deleted = this.app?.removeRoutes(nodes);
    deleted?.forEach((route) => {
      route.dispose();
    });
    this.setState({
      selection: {
        nodes: [],
        edges: [],
      },
    });
  }
}
