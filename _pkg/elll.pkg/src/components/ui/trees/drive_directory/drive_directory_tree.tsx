import { DriveFile } from "@repo/backend";
import { useContext } from "react";
import { FileTreeContext } from "../file_tree/_contexts";
import { useSortedFileTreeEntries } from "../file_tree/_hooks";
import { FileTree } from "../file_tree/file_tree";
import { FileTreeNewEntry } from "../file_tree/new_entry";

export function DriveDirectoryTree({
  directory,
}: {
  directory: DriveFile;
}): JSX.Element {
  const context = useContext(FileTreeContext);
  const [directoryEntries, fileEntries] = useSortedFileTreeEntries(directory, {
    hidden: context?.hiddenPattern,
  });

  const hasDirectoryNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type === "directory";
  const hasFileNewEntry =
    context?.newEntry?.parent === directory &&
    context?.newEntry?.type !== "directory";

  return (
    <>
      {hasDirectoryNewEntry && <FileTreeNewEntry />}
      {directoryEntries?.map((entry) => (
        <FileTree key={entry.id} file={entry} />
      ))}
      {hasFileNewEntry && <FileTreeNewEntry />}
      {fileEntries?.map((entry) => <FileTree key={entry.id} file={entry} />)}
    </>
  );
}
