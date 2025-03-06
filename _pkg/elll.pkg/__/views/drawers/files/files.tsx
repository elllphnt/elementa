import { WorkspaceDirectoryView } from "../../../components/workspace_directory";
import { mimeTypes } from "../../../libs/constants/mime_types";

export function FilesView(): JSX.Element {
  return (
    <WorkspaceDirectoryView
      path=""
      defaultFileType={mimeTypes.json}
      defaultFileTypeName="json"
      fileTypes={[
        { type: mimeTypes.json, name: "json" },
        { type: mimeTypes.html, name: "html" },
        { type: mimeTypes.css, name: "css" },
      ]}
    />
  );
}
