import React from "react";
import type { TreeNode } from "../types.js";

interface TreeItemProps {
  node: TreeNode;
  onToggle: (nodeId: string) => void;
  onSelect: (node: TreeNode) => void;
  selectedNode?: TreeNode;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  onToggle,
  onSelect,
  selectedNode,
}) => {
  const isSelected = selectedNode?.id === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.expanded;

  const handleClick = () => {
    if (node.type === "file") {
      onSelect(node);
    } else {
      onToggle(node.id);
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case "project":
        return "📁";
      case "directory":
        return isExpanded ? "📂" : "📁";
      default:
        return "📄";
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${
          isSelected ? "bg-blue-100 text-blue-800" : ""
        }`}
        onClick={handleClick}
        style={{
          paddingLeft: `${(node.path.split("/").length - 1) * 16 + 8}px`,
        }}
      >
        {hasChildren && (
          <span className="mr-1 text-xs">{isExpanded ? "▼" : "▶"}</span>
        )}
        <span className="mr-2">{getIcon()}</span>
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedNode={selectedNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TreeViewProps {
  nodes: TreeNode[];
  onToggle: (nodeId: string) => void;
  onSelect: (node: TreeNode) => void;
  selectedNode?: TreeNode;
}

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  onToggle,
  onSelect,
  selectedNode,
}) => {
  return (
    <div className="tree-view">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          onToggle={onToggle}
          onSelect={onSelect}
          selectedNode={selectedNode}
        />
      ))}
    </div>
  );
};
