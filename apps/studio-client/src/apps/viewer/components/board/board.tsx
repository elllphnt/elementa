import { useObservable } from "@elllphnt/elementa-react-utils";
import { File } from "lucide-react";
import { useState } from "react";
import { backend } from "../../../../backend/backend.js";
import { useViewerState } from "../../state.js";
import { ContentViewer } from "./content_viewer.js";

export function Board() {
  const { projectId, fileId } = useViewerState((state) => state.board);
  const [codeOnlyMode, setCodeOnlyMode] = useState(false);

  const file = useObservable(
    backend.file$(projectId, fileId),
    backend.file(projectId, fileId)
  );

  if (!projectId || !fileId || !file) {
    return (
      <div className="h-full flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-fg-400">
          <div className="text-xl mb-2">No file selected</div>
          <div className="text-sm">
            Select a file from the sidebar to view it
          </div>
        </div>
      </div>
    );
  }

  const name = file.path.split("/").pop() || "Untitled";

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* File Header */}
      <div className="border-b border-fg-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-1">
                <File className="h-4 w-4" /> <p>{name}</p>
              </h1>
              <p className="text-sm text-fg-400">
                {file.path} ({file.type})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-fg-400">
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
          fileId={fileId}
          type={file.type}
          path={file.path}
          codeOnlyMode={codeOnlyMode}
        />
      </div>
    </div>
  );
}
