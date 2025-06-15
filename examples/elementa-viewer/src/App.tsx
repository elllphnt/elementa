import React, { useState } from "react";
import { FileViewer } from "./components/FileViewer";
import { Sidebar } from "./components/Sidebar";
import type { TreeNode } from "./types";

export const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TreeNode | undefined>();

  const handleFileSelect = (node: TreeNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onFileSelect={handleFileSelect} selectedNode={selectedNode} />
      <FileViewer selectedNode={selectedNode} />
    </div>
  );
};
