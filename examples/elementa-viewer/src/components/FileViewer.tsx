import React, { useState } from "react";
import type { TreeNode } from "../types";
import { ContentViewer } from "./ContentViewer";

interface FileViewerProps {
  selectedNode?: TreeNode;
}

export const FileViewer: React.FC<FileViewerProps> = ({ selectedNode }) => {
  const [codeOnlyMode, setCodeOnlyMode] = useState(false);

  if (!selectedNode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-xl mb-2">No file selected</div>
          <div className="text-sm">
            Select a file from the sidebar to view it
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode.type !== "file") {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📁</div>
          <div className="text-xl mb-2">Directory selected</div>
          <div className="text-sm">
            Please select a file to view its content
          </div>
        </div>
      </div>
    );
  }

  // Extract project ID from the node
  const pathParts = selectedNode.id.split("/");
  const projectId = pathParts[0];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* File Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {selectedNode.name}
              </h1>
              <p className="text-sm text-gray-600">{selectedNode.path}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={codeOnlyMode}
                onChange={(e) => setCodeOnlyMode(e.target.checked)}
                className="rounded"
              />
              Code only
            </label>
          </div>
        </div>
      </div>
      {/* File Content Area */}
      <div className="flex-grow">
        <ContentViewer
          projectId={projectId}
          fileId={selectedNode.data.id}
          type={selectedNode.data.type}
          path={selectedNode.data.path}
          codeOnlyMode={codeOnlyMode}
        />
      </div>
    </div>
  );
};
