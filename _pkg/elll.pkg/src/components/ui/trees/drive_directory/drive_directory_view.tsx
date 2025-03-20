import { useObservable } from "@repo/utils";
import { useDriveFileAtPath } from "~/src/hooks/backend/file";
import { DrawerLoader } from "../../drawers/_common/drawer_loader";
import { DriveDirectoryComponent } from "./drive_directory";

interface DriveDirectoryViewProps {
  path: string;
}

export function DriveDirectoryView({
  path,
}: DriveDirectoryViewProps): JSX.Element {
  const [directory, query] = useDriveFileAtPath(path, { type: "directory" });
  const fetching = useObservable(query?.fetching$, query?.fetching);
  if (fetching) {
    return <DrawerLoader />;
  }
  if (!directory) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        Drive directory not found
        <div className="font-mono">/{path}</div>
      </div>
    );
  }
  return <DriveDirectoryComponent directory={directory} />;
}
