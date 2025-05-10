import { useObservable } from "@elllphnt/elementa-react-utils";
import { editorState } from "../state/editor";
import { fileSystem } from "../state/fs";
import { FileEditor } from "./editors/file_editor";

export function Board() {
  const activeFileId = useObservable(
    editorState.activeFileId$,
    editorState.activeFileId
  );

  // No file selected
  if (!activeFileId) {
    return (
      <div className="empty-board">
        <p>Select a file from the sidebar to edit</p>
        <style>{`
          .empty-board {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
            color: #888;
            font-size: 1.2rem;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  // File selected - fetch the file data
  const file = fileSystem.getFile(activeFileId);
  if (!file) {
    return <div>File not found</div>;
  }

  return (
    <div className="board">
      <div className="board-header">
        <h2>{file.name}</h2>
        <div className="file-type-badge">{file.type}</div>
      </div>

      <div className="editor-content">
        <FileEditor file={file} />
      </div>

      <style>{`
        .board {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .board-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .board-header h2 {
          margin: 0;
          margin-right: 12px;
        }
        .file-type-badge {
          background-color: #e0e0e0;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.8rem;
        }
        .editor-content {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
