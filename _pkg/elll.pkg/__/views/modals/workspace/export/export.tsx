import { elllEntities } from "@elllphnt/utils";
import { WorkspaceFile } from "@repo/backend";
import { useObservable } from "@repo/utils";
import { useActiveContentEditor } from "~/src/hooks/shell/editors";
import { ContentEditorExportMenu } from "./active_file";

export function ExportMenu() {
  const activeContentEditor = useActiveContentEditor();

  return (
    <div
      style={{
        width: 300,
      }}
      className="el-space-y-3"
    >
      {activeContentEditor ? (
        <ContentEditorExportMenu editor={activeContentEditor} />
      ) : (
        <></>
      )}
    </div>
  );
}
