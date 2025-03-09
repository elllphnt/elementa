import { File } from "@repo/backend";
import { FileTree } from "~/src/components/file_tree/file_tree";
import { useSortedFileTreeEntries } from "../file_tree/_hooks";

interface DriveDirectoryTreeContentProps {
  directory: File;
}

export function DriveDirectoryTreeContent({
  directory,
}: DriveDirectoryTreeContentProps): JSX.Element {
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory, {
    hidden: undefined,
  });
  // For simplicity, assume no “new entry” state
  return (
    <>
      {/* Render drive-specific actions if needed */}
      {directoryEntries.map((entry) => (
        <FileTree key={entry.id} file={entry} />
      ))}
      {fileEntries.map((entry) => (
        <FileTree key={entry.id} file={entry} />
      ))}
    </>
  );
}
