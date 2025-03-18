import { File, IFileDrive } from "@repo/backend";
import {
  elllIcons16,
  Icon,
  IconButton,
  ScrollArea,
  TextControl,
  TreeEntry,
} from "@repo/components";
import { useObservable } from "@repo/utils";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";

function Directory({
  directory,
  onFileClicked,
}: {
  directory: File;
  onFileClicked?: (file: File) => void;
}) {
  const entriesQuery = directory.entries({ autoFetch: true });
  const fetching = useObservable(entriesQuery.fetching$, entriesQuery.fetching);
  const entries = useObservable(entriesQuery.data$, entriesQuery.data);
  if (fetching) {
    return <div>Loading...</div>;
  }
  if (!entries) {
    return <div>Empty</div>;
  }
  return (
    <ScrollArea scrollY>
      {entries.map((entry) => (
        <TreeEntry
          key={entry.id}
          icon={
            <Icon
              name={
                entry.type === "directory"
                  ? elllIcons16.folderClosed
                  : elllIcons16.file
              }
            />
          }
          onClick={() => onFileClicked?.(entry)}
        >
          {entry.name}
        </TreeEntry>
      ))}
    </ScrollArea>
  );
}

export function FileExplorer({
  drive,
  initialPath = "",
  stateKey = "fileExplorer",
  onFileClicked,
}: {
  drive: IFileDrive;
  initialPath?: string;
  stateKey?: string;
  onFileClicked?: (file: File) => void;
}) {
  const [path, setPath] = useWorkspaceState<string>(
    `${stateKey}.path`,
    initialPath,
  );
  const fileQuery = drive.fileAtPath(path, { autoFetch: true });
  const fetching = useObservable(fileQuery.fetching$, fileQuery.fetching);
  const file = useObservable(fileQuery.data$, fileQuery.data);

  let content: JSX.Element;

  if (fetching) {
    content = <div>Loading...</div>;
  } else if (file) {
    if (file.type === "directory") {
      content = (
        <Directory
          directory={file}
          onFileClicked={(file) => {
            if (file.type === "directory" && file.path !== undefined) {
              setPath(file.path);
            } else {
              onFileClicked?.(file);
            }
          }}
        />
      );
    } else {
      content = <div>File: {file.name}</div>;
    }
  } else {
    content = <div>Not found</div>;
  }

  return (
    <div className="el-h-full el-w-full el-flex el-flex-col el-gap-2">
      <div className="el-flex el-items-center el-gap-2">
        <IconButton icon={elllIcons16.chevron} iconClassName="el-rotate-180" />
        <TextControl
          value={path}
          onChange={(value) => setPath(stateKey || "")}
          settings={{
            placeholder: "Path",
          }}
        />
      </div>
      <div className="el-grow el-overflow-hidden">{content}</div>
    </div>
  );
}
