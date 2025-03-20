import { useObservable } from "@repo/utils";
import { DrawerError } from "~/src/components/ui/drawers/_common/drawer_error";
import { DrawerLoader } from "~/src/components/ui/drawers/_common/drawer_loader";
import { WorkspaceDirectoryDrawer } from "~/src/components/ui/drawers/workspace_directory/workspace_directory";
import { useWorkspaceFileAtPath } from "~/src/hooks/backend/file";

export function WorkspaceOnlyFilesView(): JSX.Element {
  const [directory, query] = useWorkspaceFileAtPath("", {
    type: "directory",
  });
  const fetching = useObservable(query?.fetching$, query?.fetching);
  const error = useObservable(query?.error$, query?.error);

  if (fetching) {
    return <DrawerLoader message="Files" />;
  }
  if (error) {
    return (
      <DrawerError>
        <p>
          Failed to load workspace.
          <br />
          Click{" "}
          <span
            onClick={() => query?.fetch()}
            className="el-font-bold el-cursor-pointer"
          >
            here
          </span>{" "}
          to retry.
        </p>
      </DrawerError>
    );
  }
  if (!directory) {
    return (
      <DrawerError>
        <p>Directory not found</p>
        <p className="el-font-mono">/</p>
      </DrawerError>
    );
  }

  return <WorkspaceDirectoryDrawer root={directory} />;
}
