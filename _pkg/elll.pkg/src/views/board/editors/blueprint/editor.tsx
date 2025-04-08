// src/components/BlueprintEditor.tsx
import { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  MarkerType,
  Node,
  NodeTypes,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState, // Import Provider
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css"; // Import default styles
import {
  BlueprintData,
  RouteData,
} from "~/src/modules/elementa/project/blueprint/blueprint";
import route_node from "./route_node";
import { RouteNodeData } from "./type";
import { getLayoutedElements } from "./utils/layout";

// Define node types for React Flow
const nodeTypes: NodeTypes = {
  routeNode: route_node,
};

// --- Helper Function to parse data ---
const parseBlueprintData = (
  data?: BlueprintData,
): { initialNodes: Node<RouteNodeData>[]; initialEdges: Edge[] } => {
  const initialNodes: Node<RouteNodeData>[] = [];
  const initialEdges: Edge[] = [];

  if (!data?.routes) {
    return { initialNodes, initialEdges };
  }

  data.routes.forEach((route: RouteData) => {
    // Create Node
    initialNodes.push({
      id: route.id,
      type: "routeNode", // Use our custom node type
      data: {
        segment: route.segment,
        name: route.name,
        layoutId: route.layoutId,
        viewId: route.viewId,
      },
      // Initial position - will be overwritten by layout
      position: { x: 0, y: 0 },
    });

    // Create Edge if parentId exists
    if (route.parentId) {
      initialEdges.push({
        id: `e-${route.parentId}-${route.id}`,
        source: route.parentId,
        target: route.id,
        type: "smoothstep", // Or 'default', 'step'
        style: { stroke: "#aaa", strokeWidth: 1.5 }, // Basic edge styling
        markerEnd: {
          // Add an arrowhead
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#aaa",
        },
      });
    }
  });

  return { initialNodes, initialEdges };
};

function EditorCanvas({ blueprintData }: { blueprintData: BlueprintData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RouteNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow(); // Get fitView from context

  // New: Handler for auto layout button
  const handleAutoLayout = () => {
    const { layoutedNodes, layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      "TB",
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  useEffect(() => {
    if (blueprintData?.routes) {
      const { initialNodes, initialEdges } = parseBlueprintData(blueprintData);

      if (initialNodes.length > 0) {
        const { layoutedNodes, layoutedEdges } = getLayoutedElements(
          initialNodes,
          initialEdges,
          "TB",
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Fit view after a short delay to allow layout calculation and rendering
        // Adjust delay if needed
        const timer = setTimeout(() => {
          fitView({ padding: 0.2, duration: 300 }); // Add padding around the fitted view
        }, 100);
        return () => clearTimeout(timer); // Cleanup timeout on unmount or data change
      } else {
        setNodes([]);
        setEdges([]);
      }
    } else {
      setNodes([]);
      setEdges([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprintData, setNodes, setEdges]); // fitView is stable, no need to include

  // Callback for handling new connections (optional, if you want users to create edges)
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: "smoothstep", style: { stroke: "#aaa" } },
          eds,
        ),
      ),
    [setEdges],
  );

  const proOptions = { hideAttribution: true }; // Hide React Flow attribution for cleaner look

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange} // Handles node dragging, selection, etc.
      onEdgesChange={onEdgesChange} // Handles edge selection, deletion
      onConnect={onConnect} // Handles creating new connections
      nodeTypes={nodeTypes} // Register custom node types
      fitView // Prop to trigger fitView programmatically if needed (we use the hook)
      fitViewOptions={{ padding: 0.2, duration: 300 }} // Options for initial fitView
      proOptions={proOptions} // Hide attribution
    >
      {/* New: Auto Layout Button */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <button onClick={handleAutoLayout}>Auto Layout</button>
      </div>
      <Background
        variant={BackgroundVariant.Lines}
        gap={15}
        size={1}
        className="el-text-fg/5"
        color="currentColor"
      />
    </ReactFlow>
  );
}

function BlueprintEditor({ blueprintData }: { blueprintData: BlueprintData }) {
  return (
    <ReactFlowProvider>
      <EditorCanvas blueprintData={blueprintData} />
    </ReactFlowProvider>
  );
}

export default BlueprintEditor;
