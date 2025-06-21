import React, { useEffect, useState } from "react";
import { elementaAPI } from "../api.js";
import type { FileData, TreeNode } from "../types.js";
import { TreeView } from "./TreeView.js";

interface SidebarProps {
  onFileSelect: (node: TreeNode) => void;
  selectedNode?: TreeNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onFileSelect,
  selectedNode,
}) => {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await elementaAPI.getProjects();
      const projectNodes: TreeNode[] = projects.map((project) => ({
        id: project.id,
        name: project.name,
        type: "project",
        path: project.name,
        children: [],
        expanded: false,
        data: project,
      }));
      setTreeNodes(projectNodes);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const buildFileTree = (
    files: FileData[],
    projectName: string
  ): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Sort files to ensure directories come before their contents
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

    for (const file of sortedFiles) {
      const pathParts = file.path.split("/").filter((part) => part.length > 0);
      let currentPath = "";
      let parentNodes = rootNodes;
      let parentMap = nodeMap;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLastPart = i === pathParts.length - 1;
        const nodeId = `${projectName}/${currentPath}`;

        if (!parentMap.has(nodeId)) {
          const node: TreeNode = {
            id: nodeId,
            name: part,
            type: isLastPart ? "file" : "directory",
            path: currentPath,
            children: isLastPart ? undefined : [],
            expanded: false,
            data: file || {},
          };

          parentMap.set(nodeId, node);
          parentNodes.push(node);
        }

        const currentNode = parentMap.get(nodeId)!;
        if (!isLastPart && currentNode.children) {
          parentNodes = currentNode.children;
          // Create a new map for the next level
          parentMap = new Map();
          for (const child of currentNode.children) {
            parentMap.set(child.id, child);
          }
        }
      }
    }

    return rootNodes;
  };

  const loadProjectFiles = async (projectId: string, projectName: string) => {
    try {
      const files = await elementaAPI.getFiles(projectId);
      const fileTree = buildFileTree(files, projectName);

      setTreeNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === projectId
            ? { ...node, children: fileTree, expanded: true }
            : node
        )
      );
    } catch (err) {
      console.error("Error loading project files:", err);
      setError("Failed to load project files");
    }
  };

  const handleToggle = async (nodeId: string) => {
    const node = findNodeById(treeNodes, nodeId);
    if (!node) return;

    if (node.type === "project" && !node.expanded) {
      await loadProjectFiles(node.id, node.name);
    } else {
      setTreeNodes((prevNodes) => updateNodeExpansion(prevNodes, nodeId));
    }
  };

  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNodeExpansion = (
    nodes: TreeNode[],
    nodeId: string
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeExpansion(node.children, nodeId),
        };
      }
      return node;
    });
  };

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={loadProjects}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
      </div>
      <div className="p-2">
        <TreeView
          nodes={treeNodes}
          onToggle={handleToggle}
          onSelect={onFileSelect}
          selectedNode={selectedNode}
        />
      </div>
    </div>
  );
};
