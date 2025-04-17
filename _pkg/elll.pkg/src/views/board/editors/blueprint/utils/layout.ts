// src/utils/layoutUtils.ts
import dagre from "@dagrejs/dagre";
import { Edge, Node } from "@xyflow/react";
import { RouteNodeData } from "../type";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Define typical node dimensions (adjust as needed based on RouteNode styling)
const NODE_WIDTH = 170;
const NODE_HEIGHT = 80;

type LayoutDirection = "TB" | "LR"; // Top-Bottom or Left-Right

export const getLayoutedElements = (
  nodes: Node<RouteNodeData>[],
  edges: Edge[],
  direction: LayoutDirection = "TB",
): { layoutedNodes: Node<RouteNodeData>[]; layoutedEdges: Edge[] } => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 }); // Increase spacing

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We need to center the node position relative to the calculated layout coordinate
    const newPosition = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };

    return { ...node, position: newPosition };
  });

  return { layoutedNodes, layoutedEdges: edges };
};
