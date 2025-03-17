import { ProgressBar } from "@repo/components";
import { useObservable } from "@repo/utils";
import { useDriveFileAtPath } from "~/src/hooks/backend/file";
import { DriveDirectoryContent } from "./drive_directory_content";

interface DriveDirectoryViewProps {
  path: string;
}

export function DriveDirectoryView({
  path,
}: DriveDirectoryViewProps): JSX.Element {
  const [directory, query] = useDriveFileAtPath(path, { type: "directory" });
  const fetching = useObservable(query?.fetching$, query?.fetching);
  if (fetching) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        <div className="font-mono">Drive: /{path}</div>
        <div style={{ width: 40 }}>
          <ProgressBar />
        </div>
      </div>
    );
  }
  if (!directory) {
    return (
      <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
        Drive directory not found
        <div className="font-mono">Drive: /{path}</div>
      </div>
    );
  }
  return <DriveDirectoryContent directory={directory} />;
}
