import { File } from "@repo/backend";
import { ControlMenuContainer } from "@repo/components";
import { FileExplorer } from "~/src/components/ui/file_explorer/file_explorer";
import { useWorkspace } from "~/src/hooks/backend/workspace";

export function WorkspaceFileExplorerView({
  initialPath = "",
  stateKey,
  onFileClicked,
  onSelect,
}: {
  initialPath?: string;
  stateKey?: string;
  onFileClicked?: (file: File) => void;
  onSelect?: (file: File) => void;
}) {
  const workspace = useWorkspace();

  if (!workspace) return <></>;

  return (
    <ControlMenuContainer style={{ width: 300, height: 400 }}>
      <FileExplorer
        drive={workspace}
        initialPath={initialPath}
        stateKey={stateKey}
        onFileClicked={onFileClicked}
        onSelect={onSelect}
      />
    </ControlMenuContainer>
  );
}
