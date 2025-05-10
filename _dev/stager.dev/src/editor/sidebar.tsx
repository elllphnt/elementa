import { useObservable } from "@elllphnt/elementa-react-utils";
import { useState } from "react";
import { editorState } from "../state/editor";
import { File, fileSystem } from "../state/fs";
import { FileType, fileTypes } from "../state/types";

export function SideBar() {
  const filesMap = useObservable(fileSystem.files$, fileSystem.files);
  const activeFileId = useObservable(
    editorState.activeFileId$,
    editorState.activeFileId
  );
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<FileType>("component");

  const files = Object.values(filesMap);

  function handleFileClick(id: string) {
    editorState.setActiveFileId(id);
  }

  function handleCreateFile() {
    if (newFileName.trim()) {
      const file = fileSystem.createFile(newFileName, newFileType);
      editorState.setActiveFileId(file.id);
      setNewFileName("");
      setIsCreatingFile(false);
    }
  }

  function handleDeleteFile(id: string) {
    fileSystem.deleteFile(id);
    if (activeFileId === id) {
      editorState.setActiveFileId("");
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Files</h2>
        <button onClick={() => setIsCreatingFile(true)}>+ New File</button>
      </div>

      {isCreatingFile && (
        <div className="new-file-form">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="File name"
            autoFocus
          />
          <select
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value as FileType)}
          >
            {Object.entries(fileTypes).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
          <div className="form-actions">
            <button onClick={handleCreateFile}>Create</button>
            <button onClick={() => setIsCreatingFile(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="file-list">
        {files.length > 0 ? (
          files.map((file) => (
            <FileItem
              key={file.id}
              file={new File({ id: file.id, fileSystem })}
              isSelected={file.id === activeFileId}
              onClick={() => handleFileClick(file.id)}
              onDelete={() => handleDeleteFile(file.id)}
            />
          ))
        ) : (
          <div className="empty-state">
            No files yet. Create one to get started!
          </div>
        )}
      </div>

      <style>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 16px;
        }
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .file-list {
          flex: 1;
          overflow-y: auto;
        }
        .new-file-form {
          background-color: #e0e0e0;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .new-file-form input,
        .new-file-form select {
          width: 100%;
          margin-bottom: 8px;
          padding: 6px;
        }
        .form-actions {
          display: flex;
          gap: 8px;
        }
        .empty-state {
          color: #888;
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
}

interface FileItemProps {
  file: File;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function FileItem({ file, isSelected, onClick, onDelete }: FileItemProps) {
  const name = useObservable(file.name$, file.name);
  const type = useObservable(file.type$, file.type);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);

  function handleSave() {
    if (editName.trim()) {
      file.setName(editName);
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditName(name);
      setIsEditing(false);
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case fileTypes.component:
        return "🧩";
      case fileTypes.hook:
        return "🪝";
      case fileTypes.routine:
        return "⚙️";
      case fileTypes.context:
        return "🔄";
      case fileTypes.app:
        return "📱";
      case fileTypes.primitive:
        return "🔨";
      default:
        return "📄";
    }
  };

  return (
    <div
      className={`file-item ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="file-icon">{getFileIcon(type)}</div>

      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="file-name">{name}</div>
      )}

      <div className="file-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="edit-btn"
          onClick={() => {
            setEditName(name);
            setIsEditing(true);
          }}
        >
          ✏️
        </button>
        <button className="delete-btn" onClick={onDelete}>
          🗑️
        </button>
      </div>

      <style>{`
        .file-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .file-item:hover {
          background-color: #e8e8e8;
        }
        .file-item.selected {
          background-color: #d0d0d0;
        }
        .file-icon {
          margin-right: 8px;
          font-size: 16px;
        }
        .file-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .file-item:hover .file-actions {
          opacity: 1;
        }
        .file-actions button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 2px;
        }
        input {
          flex: 1;
          padding: 2px 4px;
          border: 1px solid #aaa;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
