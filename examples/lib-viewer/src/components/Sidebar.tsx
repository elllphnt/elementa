import React, { useEffect, useState } from "react";
import { type FileTreeItem } from "../types.js";
import "./Sidebar.css";

interface SidebarProps {
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
}

const FileTreeNode: React.FC<{
  item: FileTreeItem;
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
  level: number;
}> = ({ item, onFileSelect, selectedFile, level }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleFileClick = () => {
    if (item.type === "file") {
      onFileSelect(item.path);
    }
  };

  const isSelected = selectedFile === item.path;

  return (
    <div className="file-tree-node" style={{ paddingLeft: `${level * 16}px` }}>
      <div
        className={`file-tree-item ${isSelected ? "selected" : ""}`}
        onClick={item.type === "directory" ? toggleExpand : handleFileClick}
      >
        {item.type === "directory" && (
          <span className="expander" onClick={toggleExpand}>
            {isExpanded ? "▼" : "►"}
          </span>
        )}
        <span className={`icon ${item.type}`}></span>
        <span className="name">{item.name}</span>
      </div>

      {item.type === "directory" && isExpanded && item.children && (
        <div className="children">
          {item.children.map((child, index) => (
            <FileTreeNode
              key={index}
              item={child}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, selectedFile }) => {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch file tree on component mount
    fetchFileTree();
  }, []);

  const fetchFileTree = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/api/filetree");

      if (!response.ok) {
        throw new Error("Failed to fetch file tree");
      }

      const data = await response.json();
      setFileTree(data);
    } catch (err) {
      setError("Error fetching file tree");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="sidebar">Loading file tree...</div>;
  }
  if (error) {
    return <div className="sidebar error">{error}</div>;
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Files</h2>
      </div>
      <div className="file-tree">
        {fileTree.map((item, index) => (
          <FileTreeNode
            key={index}
            item={item}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
            level={0}
          />
        ))}
        {fileTree.length === 0 && (
          <div className="empty-tree">Loading files...</div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
