// src/components/BlueprintEditor.tsx
import { elllIcons16, Icon } from "@repo/components";
import { useObservable } from "@repo/utils";
import {
  Background,
  BackgroundVariant,
  Node,
  NodeTypes,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnConnectStartParams,
  OnEdgesChange,
  OnNodesChange,
  OnSelectionChangeFunc,
  ReactFlow,
  ReactFlowProvider,
  Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { BlueprintEditor } from "~/src/editors/blueprint/editor";
import { Menu } from "./menu";
import RouteNode from "./route_node";

const nodeTypes: NodeTypes = {
  route: RouteNode,
};

export function BlueprintEditorComponent({
  editor,
}: {
  editor: BlueprintEditor;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<OnConnectStartParams>();
  const routes = useObservable(editor.routes$, editor.routes);
  const nodeInfos = useObservable(editor.nodes$, editor.nodes);
  const edges = useObservable(editor.edges$, editor.edges);
  const state = useObservable(editor.state$, editor.state);

  const nodes = useMemo(() => {
    return routes.map((route) => {
      const info = nodeInfos[route.id];
      const node: Node = {
        id: route.id,
        type: "route",
        data: {
          editor: editor,
          route,
        },
        position: info?.position || { x: 0, y: 0 },
      };
      return node;
    });
  }, [routes, nodeInfos, editor]);

  useLayoutEffect(() => {
    if (ref.current) {
      editor.setRootDom(ref.current);
    }
  }, [editor]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      for (const change of changes) {
        switch (change.type) {
          case "position": {
            if (change.position) {
              editor.blueprint?.updateNode(change.id, {
                position: change.position,
              });
            }
            break;
          }
        }
      }
    },
    [editor],
  );
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {},
    [editor],
  );
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (!connection.target || !connection.source) return;
      const route = editor.app?.route(connection.target);
      route?.update({
        parentId: connection.source,
      });
      connectionRef.current = undefined;
    },
    [editor],
  );
  const handleConnectStart: OnConnectStart = useCallback((_, params) => {
    connectionRef.current = params;
  }, []);
  const handleConnectEnd: OnConnectEnd = useCallback((event) => {
    // allow connection to occur if possible
    setTimeout(() => {
      const param = connectionRef.current;
      connectionRef.current = undefined;

      const rect = editor.getRootWindowRect();
      if (!rect) return;

      if (param && rect && event instanceof MouseEvent) {
        const absolutePosition = {
          x: event.clientX,
          y: event.clientY,
        };
        const viewport = editor.state.viewport;
        const position = {
          x: absolutePosition.x - rect.x,
          y: absolutePosition.y - rect.y,
        };
        const adjustedPosition = {
          x: (position.x - viewport.x) / viewport.zoom,
          y: (position.y - viewport.y) / viewport.zoom,
        };

        if (param.handleType === "source") {
          editor.addRoute({
            parentId: param.nodeId || undefined,
            node: {
              position: adjustedPosition,
            },
          });
        } else {
          editor.addRoute({
            childId: param.nodeId || undefined,
            node: {
              position,
            },
          });
        }
      }
    });
  }, []);
  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      editor.setState({ viewport });
    },
    [editor],
  );

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    (selection) => {
      const nodes = selection?.nodes?.map((node: any) => node.id) || [];
      const edges = selection?.edges?.map((edge: any) => edge.id) || [];
      editor.setState({ selection: { nodes, edges } });
    },
    [editor],
  );

  const handleDelete = useCallback(() => {
    editor.deleteSelection();
  }, [editor]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        selectionOnDrag
        onConnectEnd={handleConnectEnd}
        onConnectStart={handleConnectStart}
        viewport={state.viewport}
        onViewportChange={handleViewportChange}
        onSelectionChange={handleSelectionChange}
      >
        <Menu editor={editor} />
        {/* Auto Layout & Delete Buttons */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            display: "flex",
            gap: 10,
          }}
        >
          <button onClick={() => editor.autoLayout()}>Auto Layout</button>
          <button onClick={handleDelete}>Delete Selected</button>
        </div>
        <Background
          variant={BackgroundVariant.Lines}
          gap={15}
          size={1}
          className="el-text-fg/5"
          color="currentColor"
        />

        {nodes.length === 0 && (
          <div
            style={{
              position: "absolute",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 10,
              inset: 0,
              zIndex: 10,
            }}
          >
            <button
              className="el-bg-bg hover:el-bg-bg-100 el-text-fg el-border el-rounded-full el-flex el-items-center el-justify-center"
              style={{
                width: 40,
                height: 40,
              }}
              onClick={() => {
                if (!editor.app) return;
                const route = editor.app.createRoute();
                editor.app.addRoute(route);
              }}
            >
              <Icon name={elllIcons16.plus} />
            </button>
            <div className="el-text-sm">Add a route to get started</div>
          </div>
        )}
      </ReactFlow>
    </ReactFlowProvider>
  );
}
